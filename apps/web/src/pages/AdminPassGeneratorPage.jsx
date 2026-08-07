import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileSpreadsheet, Download, FileText, CheckCircle, 
  Settings, Search, ArrowLeft, RefreshCw, ZoomIn, ZoomOut, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import PassCard from '../components/PassCard.jsx';
import EventFooter from '../components/EventFooter.jsx';

export default function AdminPassGeneratorPage() {
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedPassIndex, setSelectedPassIndex] = useState(0);
  const [previewSide, setPreviewSide] = useState("front"); // "front" or "back"
  const [zoom, setZoom] = useState(0.22);
  const [searchQuery, setSearchQuery] = useState("");
  const [startingPassSeq, setStartingPassSeq] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [previewModalData, setPreviewModalData] = useState(null);
  const [modalPassIndex, setModalPassIndex] = useState(0);
  const [modalSide, setModalSide] = useState("front");
  const [modalZoom, setModalZoom] = useState(0.24);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [currentAllIndex, setCurrentAllIndex] = useState(0);
  
  // Ref for rendering off-screen pass card for image capture
  const offscreenRenderRef = useRef(null);
  const [renderProps, setRenderProps] = useState(null);

  // Helper: Format sequence to six-digit string, e.g. PVC-2026-000021
  const formatPassNumber = (seq) => {
    return `PVC-2026-${seq.toString().padStart(6, '0')}`;
  };

  // Helper: Parse sequence digit from formatted pass number string
  const parsePassSeq = (passNumStr) => {
    if (!passNumStr) return 0;
    // Extract numbers after PVC-2026-
    const match = passNumStr.match(/PVC-2026-(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    const anyMatch = passNumStr.match(/(\d+)$/);
    if (anyMatch && anyMatch[1]) {
      return parseInt(anyMatch[1], 10);
    }
    return 0;
  };

  // Smart header column matching
  const mapRowData = (rawRow) => {
    const keys = Object.keys(rawRow);
    
    // Find column matches
    const nameKey = keys.find(k => /name|applicant|full\s*name/i.test(k)) || 'Name';
    const mobileKey = keys.find(k => /mobile|phone|whatsapp|contact/i.test(k)) || 'Mobile Number (WhatsApp)';
    const cityKey = keys.find(k => /city|address|location/i.test(k)) || 'City';
    const countKey = keys.find(k => /pass\s*count|passes|number\s*of\s*passes|required|no\s*of/i.test(k)) || 'Number of Passes Required';
    const additionalKey = keys.find(k => /additional|names\s*of\s*additional|other\s*names|participants/i.test(k)) || 'Names of Additional Participants';

    const passGeneratedKey = keys.find(k => /pass\s*generated/i.test(k)) || 'Pass Generated';
    const passNumKey = keys.find(k => /pass\s*number/i.test(k)) || 'Pass Number';
    const genDateKey = keys.find(k => /generated\s*date/i.test(k)) || 'Generated Date';
    const genTimeKey = keys.find(k => /generated\s*time/i.test(k)) || 'Generated Time';
    const statusKey = keys.find(k => /status/i.test(k)) || 'Status';

    return {
      name: rawRow[nameKey] ? rawRow[nameKey].toString().trim() : '',
      mobile: rawRow[mobileKey] ? rawRow[mobileKey].toString().trim() : '',
      city: rawRow[cityKey] ? rawRow[cityKey].toString().trim() : '',
      passCount: rawRow[countKey] ? parseInt(rawRow[countKey], 10) || 1 : 1,
      additionalNames: rawRow[additionalKey] ? rawRow[additionalKey].toString().trim() : '',
      
      // Generation Logs (from existing column values or defaults)
      passGenerated: rawRow[passGeneratedKey] || 'NO',
      passNumber: rawRow[passNumKey] || '',
      generatedDate: rawRow[genDateKey] || '',
      generatedTime: rawRow[genTimeKey] || '',
      status: rawRow[statusKey] || 'Pending',
      
      // Preserve original keys for when we re-export back to Excel
      _originalKeys: {
        nameKey, mobileKey, cityKey, countKey, additionalKey,
        passGeneratedKey, passNumKey, genDateKey, genTimeKey, statusKey
      }
    };
  };

  // Scan current table state to find the next available sequence number
  useEffect(() => {
    if (excelData.length > 0) {
      let maxSeq = 0;
      excelData.forEach(row => {
        if (row.passNumber) {
          // Parse ranges like "PVC-2026-000021 to PVC-2026-000024" or single "PVC-2026-000001"
          const parts = row.passNumber.split(/\s+to\s+|\s*-\s*/i);
          parts.forEach(part => {
            const seq = parsePassSeq(part.trim());
            if (seq > maxSeq) maxSeq = seq;
          });
        }
      });
      setStartingPassSeq(maxSeq + 1);
    }
  }, [excelData]);

  // Handle Excel Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          toast.error("The uploaded Excel file contains no data.");
          return;
        }

        const mappedData = json.map(row => mapRowData(row));
        setExcelData(mappedData);
        setSelectedRowIndex(0); // Select first row for preview
        setSelectedPassIndex(0);
        toast.success(`Successfully loaded ${mappedData.length} records from Excel!`);
      } catch (err) {
        console.error(err);
        toast.error("Error reading Excel file. Make sure it is a valid .xlsx file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Get participant list for a specific row
  const getParticipantList = (row) => {
    const list = [row.name];
    const passCount = parseInt(row.passCount, 10) || 1;
    if (passCount > 1) {
      // Split additional names by newline, comma, or semicolon, and filter out empty
      const addNames = row.additionalNames
        ? row.additionalNames
            .split(/[\r\n,;]+/)
            .map(n => n.trim())
            .filter(Boolean)
        : [];
      
      for (let i = 1; i < passCount; i++) {
        if (addNames[i - 1]) {
          list.push(addNames[i - 1]);
        } else {
          list.push(`${row.name} (Guest ${i})`);
        }
      }
    }
    return list;
  };

  // Handle click on "Generate Pass" - prepares data and opens the Preview Modal
  const clickGeneratePass = (index) => {
    const row = excelData[index];
    if (!row.name) {
      toast.error("Applicant Name is empty in this row.");
      return;
    }

    const passCount = row.passCount || 1;
    let currentSeq = startingPassSeq;
    const participants = getParticipantList(row);
    const passAssignments = [];

    for (let i = 0; i < passCount; i++) {
      passAssignments.push({
        name: participants[i],
        passNumber: formatPassNumber(currentSeq),
        mobile: row.mobile,
        city: row.city
      });
      currentSeq++;
    }

    setModalPassIndex(0);
    setModalSide("front");
    setModalZoom(0.24);
    setPreviewModalData({
      rowIndex: index,
      passAssignments
    });
  };

  // Triggered when user confirms generation from the Preview Modal
  const confirmGeneratePass = async () => {
    if (!previewModalData) return;
    const { rowIndex, passAssignments } = previewModalData;
    
    // Close the preview modal first
    setPreviewModalData(null);
    
    // Start generating passes
    await executeGeneratePass(rowIndex, passAssignments);
  };

  // Run PDF Generation for the verified list of passes (Front & Back for each pass combined into one file)
  const executeGeneratePass = async (rowIndex, passAssignments, customRow = null) => {
    const row = customRow || excelData[rowIndex];
    setIsGenerating(true);
    if (!isGeneratingAll) {
      setGenerationProgress("Preparing tickets...");
    }

    const passCount = passAssignments.length;
    
    // Set starting pass sequence for future rows (so we don't conflict)
    const lastSeq = parsePassSeq(passAssignments[passCount - 1].passNumber);
    setStartingPassSeq(lastSeq + 1);

    try {
      // jsPDF setup - standard 2484x1128 print-ready aspect ratio
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [2484, 1128]
      });

      for (let i = 0; i < passCount; i++) {
        const assignment = passAssignments[i];
        
        // 1. Capture Front Side
        if (isGeneratingAll) {
          setGenerationProgress(`[Record ${currentAllIndex} - Pass ${i + 1}/${passCount}] Rendering Front Side...`);
        } else {
          setGenerationProgress(`Rendering pass ${i + 1} of ${passCount} (Front Side)...`);
        }

        // Update target renderProps so the offscreen React component re-renders
        await new Promise((resolve) => {
          setRenderProps({
            name: assignment.name,
            mobile: assignment.mobile,
            city: assignment.city,
            passNumber: assignment.passNumber
          });
          // Wait for render cycle
          setTimeout(resolve, 150);
        });

        // Wait until render engine completes calculations and painted frames
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
        await new Promise(r => setTimeout(r, 100)); // safe buffer

        // Capture offscreen element Front side
        const frontEl = document.getElementById(`pass-front-${assignment.passNumber}`);
        if (!frontEl) {
          throw new Error("Front pass card element not found in DOM.");
        }

        const frontDataUrl = await toJpeg(frontEl, {
          quality: 0.82,
          width: 2484,
          height: 1128,
          cacheBust: false,
          pixelRatio: 1,
          fontEmbedCSS: '', // Disables embedding massive Google Fonts base64 string, preventing major OOM leaks
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });

        if (i > 0) {
          pdf.addPage([2484, 1128], 'landscape');
        }
        pdf.addImage(frontDataUrl, 'JPEG', 0, 0, 2484, 1128, undefined, 'FAST');

        // 2. Capture Back Side
        if (isGeneratingAll) {
          setGenerationProgress(`[Record ${currentAllIndex} - Pass ${i + 1}/${passCount}] Rendering Back Side...`);
        } else {
          setGenerationProgress(`Rendering pass ${i + 1} of ${passCount} (Back Side)...`);
        }
        
        const backEl = document.getElementById(`pass-back-${assignment.passNumber}`);
        if (!backEl) {
          throw new Error("Back pass card element not found in DOM.");
        }

        // Wait a tiny bit for layout stability
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
        await new Promise(r => setTimeout(r, 100));

        const backDataUrl = await toJpeg(backEl, {
          quality: 0.82,
          width: 2484,
          height: 1128,
          cacheBust: false,
          pixelRatio: 1,
          fontEmbedCSS: '', // Disables embedding massive Google Fonts base64 string, preventing major OOM leaks
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        });

        pdf.addPage([2484, 1128], 'landscape');
        pdf.addImage(backDataUrl, 'JPEG', 0, 0, 2484, 1128, undefined, 'FAST');
      }

      // Save PDF for this row (containing all passes for this applicant combined!)
      const safeName = row.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      pdf.save(`${safeName}_pvc_pass.pdf`);

      // Generate date & time strings
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
      
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      const formattedTime = `${hours.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${ampm}`;

      const passNumberRange = passCount === 1 
        ? passAssignments[0].passNumber 
        : `${passAssignments[0].passNumber} to ${passAssignments[passCount - 1].passNumber}`;

      // Update excel data state
      setExcelData(prevData => {
        const updated = [...prevData];
        updated[rowIndex] = {
          ...row,
          passGenerated: 'YES',
          passNumber: passNumberRange,
          generatedDate: formattedDate,
          generatedTime: formattedTime,
          status: 'Generated'
        };
        return updated;
      });
      
      if (!isGeneratingAll) {
        toast.success(`Successfully generated ${passCount} passes (combined PDF) for ${row.name}!`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to generate passes: ${err.message}`);
    } finally {
      // Always unmount the off-screen cards immediately to clear memory of DOM nodes and assets
      setRenderProps(null);
      if (!isGeneratingAll) {
        setIsGenerating(false);
        setGenerationProgress("");
      }
    }
  };

  // Master function to generate passes for all records in the list in one click
  const handleGenerateAllPasses = async () => {
    if (excelData.length === 0) return;
    setIsGeneratingAll(true);
    setIsGenerating(true);
    
    try {
      let seq = startingPassSeq;
      const totalRecords = excelData.length;
      let newlyGeneratedCount = 0;
      
      // Local copy to prevent stale closures of excelData state during batch runs
      const currentList = [...excelData];
      
      for (let idx = 0; idx < totalRecords; idx++) {
        const row = currentList[idx];
        if (!row.name) continue;
        
        // Skip already generated records to enable resuming bulk generation seamlessly
        if (row.passGenerated === 'YES') {
          continue;
        }
        
        const passCount = row.passCount || 1;
        const participants = getParticipantList(row);
        const passAssignments = [];
        for (let i = 0; i < passCount; i++) {
          passAssignments.push({
            name: participants[i],
            passNumber: formatPassNumber(seq),
            mobile: row.mobile,
            city: row.city
          });
          seq++;
        }
        
        setCurrentAllIndex(idx + 1);
        setGenerationProgress(`[Record ${idx + 1} of ${totalRecords}] Preparing passes for ${row.name}...`);
        
        // Wait for PDF generation of this record to finish
        await executeGeneratePass(idx, passAssignments, row);
        
        // Local timestamp logs to keep currentList updated for auto-saves
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        const formattedTime = `${hours.toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${ampm}`;
        const passNumberRange = passCount === 1 
          ? passAssignments[0].passNumber 
          : `${passAssignments[0].passNumber} to ${passAssignments[passCount - 1].passNumber}`;

        currentList[idx] = {
          ...row,
          passGenerated: 'YES',
          passNumber: passNumberRange,
          generatedDate: formattedDate,
          generatedTime: formattedTime,
          status: 'Generated'
        };

        newlyGeneratedCount++;
        
        // Update sequence for next rows
        seq = parsePassSeq(passAssignments[passCount - 1].passNumber) + 1;

        // Auto-save progress to Excel every 5 newly generated rows
        if (newlyGeneratedCount > 0 && newlyGeneratedCount % 5 === 0) {
          setGenerationProgress(`[Record ${idx + 1}/${totalRecords}] Auto-saving progress to Excel...`);
          const backupName = `pvc_passes_backup_row_${idx + 1}.xlsx`;
          handleExportExcel(currentList, backupName);
          await new Promise(r => setTimeout(r, 1000)); // safe buffer
        }
        
        // Memory-safe batch cooling: Every 10 records, take a larger breath to yield JS thread & let GC flush
        if ((idx + 1) % 10 === 0 && idx < totalRecords - 1) {
          setGenerationProgress(`[Record ${idx + 1}/${totalRecords}] Cleaning memory buffer for next batch...`);
          await new Promise(r => setTimeout(r, 2200));
        } else {
          // Standard yield delay
          await new Promise(r => setTimeout(r, 700));
        }
      }
      
      toast.success("Successfully generated all passes for the entire list!");
    } catch (err) {
      console.error(err);
      toast.error(`Bulk generation failed: ${err.message}`);
    } finally {
      setIsGeneratingAll(false);
      setIsGenerating(false);
      setGenerationProgress("");
      setRenderProps(null);
    }
  };

  // Export updated data to Excel file (supports auto-saving current progress)
  const handleExportExcel = (customData = null, customName = null) => {
    const targetData = customData || excelData;
    if (targetData.length === 0) {
      toast.error("No data to export.");
      return;
    }

    try {
      // Re-map the clean UI states back to the original headers or standard logging structure
      const exportRows = targetData.map(row => {
        const orig = row._originalKeys || {};
        return {
          [orig.nameKey || 'Name']: row.name,
          [orig.mobileKey || 'Mobile Number (WhatsApp)']: row.mobile,
          [orig.cityKey || 'City']: row.city,
          [orig.countKey || 'Number of Passes Required']: row.passCount,
          [orig.additionalKey || 'Names of Additional Participants']: row.additionalNames,
          'Pass Generated': row.passGenerated,
          'Pass Number': row.passNumber,
          'Generated Date': row.generatedDate,
          'Generated Time': row.generatedTime,
          'Status': row.status
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Passes");

      const exportName = customName || (fileName 
        ? fileName.replace(/\.xlsx$/i, '_updated.xlsx') 
        : 'param_vir_chakra_passes_updated.xlsx');

      XLSX.writeFile(workbook, exportName);
      if (!customName) {
        toast.success("Updated Excel spreadsheet downloaded successfully!");
      } else {
        toast.info(`Auto-saved progress: ${exportName}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to export Excel file: " + err.message);
    }
  };

  // Filtered rows based on Search Bar query
  const filteredData = excelData.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      row.name.toLowerCase().includes(query) ||
      row.mobile.includes(query) ||
      (row.passNumber && row.passNumber.toLowerCase().includes(query)) ||
      (row.city && row.city.toLowerCase().includes(query))
    );
  });

  const selectedRow = selectedRowIndex !== null ? excelData[selectedRowIndex] : null;
  const participantList = selectedRow ? getParticipantList(selectedRow) : [];

  return (
    <>
      <Helmet>
        <title>Admin Pass Generator | Param Vir Chakra – Shauryagatha</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Generation Loading Modal overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#02050a]/90 flex flex-col items-center justify-center z-50 p-6 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#ff9933]/10 blur-xl animate-pulse" />
              <RefreshCw className="h-16 w-16 text-[#ff9933] animate-spin relative" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mt-6">Generating Digital Pass PDF</h3>
            <p className="text-white/60 text-sm mt-2 max-w-sm tracking-wide">
              {generationProgress}
            </p>
            <p className="text-[#ff9933]/70 font-semibold text-xs uppercase mt-6 tracking-[0.2em] animate-pulse">
              Please do not close this window
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal Popup before generating */}
      <AnimatePresence>
        {previewModalData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#02050a]/90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#081224] border border-white/10 rounded-[2.5rem] w-full max-w-4xl p-6 md:p-8 max-h-[95vh] overflow-y-auto shadow-2xl relative flex flex-col justify-between"
            >
              {/* Header */}
              <div className="border-b border-white/10 pb-4 mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-gradient">Review Digital Passes</h3>
                  <p className="text-xs text-white/50 mt-1">
                    Confirm details before generating PDF for {excelData[previewModalData.rowIndex].name} ({previewModalData.passAssignments.length} passes)
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Zoom Controls */}
                  <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-semibold gap-1 items-center">
                    <span className="text-white/40 text-[9px] uppercase font-bold tracking-wider px-2">Zoom:</span>
                    {[
                      { label: "25%", value: 0.24 },
                      { label: "50%", value: 0.38 },
                      { label: "75%", value: 0.55 },
                      { label: "100%", value: 1.00 }
                    ].map((z) => (
                      <button
                        key={z.value}
                        onClick={() => setModalZoom(z.value)}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          modalZoom === z.value ? 'bg-[#ff9933] text-white' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {z.label}
                      </button>
                    ))}
                  </div>

                  {/* Side Switcher */}
                  <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-semibold">
                    <button
                      onClick={() => setModalSide("front")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        modalSide === 'front' ? 'bg-[#ff9933] text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Front Side
                    </button>
                    <button
                      onClick={() => setModalSide("back")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        modalSide === 'back' ? 'bg-[#ff9933] text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Back Side
                    </button>
                  </div>
                </div>
              </div>

              {/* Selector for multi-pass bookings */}
              {previewModalData.passAssignments.length > 1 && (
                <div className="mb-4 bg-white/2px p-3 rounded-2xl border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                    Select Participant Pass to Inspect:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {previewModalData.passAssignments.map((assignment, idx) => (
                      <button
                        key={idx}
                        onClick={() => setModalPassIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                          modalPassIndex === idx 
                            ? 'bg-[#ff9933]/15 text-[#ff9933] border-[#ff9933]/30' 
                            : 'bg-white/5 text-white/55 border-transparent hover:bg-white/10'
                        }`}
                      >
                        Pass {idx + 1}: {assignment.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pass Card Container */}
              <div className="relative flex justify-center items-center border border-white/10 rounded-2xl bg-[#02050a] p-4 overflow-hidden h-[420px] w-full mb-6">
                <div 
                  style={{ 
                    width: `${2484 * modalZoom}px`, 
                    height: `${1128 * modalZoom}px`, 
                    position: 'relative'
                  }}
                  className="select-none pointer-events-none"
                >
                  <div
                    style={{
                      width: '2484px',
                      height: '1128px',
                      transform: `scale(${modalZoom})`,
                      transformOrigin: 'top left',
                      position: 'absolute',
                      left: 0,
                      top: 0
                    }}
                  >
                    <PassCard 
                      name={previewModalData.passAssignments[modalPassIndex].name}
                      mobile={previewModalData.passAssignments[modalPassIndex].mobile}
                      city={previewModalData.passAssignments[modalPassIndex].city}
                      passNumber={previewModalData.passAssignments[modalPassIndex].passNumber}
                      scale={1}
                      activeSide={modalSide}
                      previewMode={true}
                    />
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setPreviewModalData(null)}
                  className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/50 font-medium">Looks Good?</span>
                  <button
                    onClick={confirmGeneratePass}
                    className="px-6 py-3 rounded-xl bg-[#ff9933] text-white hover:bg-[#ffaa4d] text-sm font-bold shadow-lg shadow-[#ff9933]/10 transition-all"
                  >
                    Generate PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-[#040914] text-white relative py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden font-sans">
        
        {/* Ambient Lights */}
        <div className="absolute left-1/4 top-1/4 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9933]/5 blur-[150px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-1/4 -z-10 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#138808]/5 blur-[150px] pointer-events-none" />

        {/* Back Link */}
        <div className="mx-auto max-w-7xl mb-6">
          <Link 
            to="/param-vir-chakra"
            className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-bold text-white/90 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-[#ff9933]"
          >
            <ArrowLeft className="h-4 w-4" /> Go back to event page
          </Link>
        </div>

        {/* Layout Container */}
        <div className="mx-auto max-w-7xl">
          
          {/* Header Plaque */}
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#081224]/60 p-8 md:p-10 shadow-2xl backdrop-blur-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />
            
            <div className="text-center md:text-left">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-white md:text-4xl">
                Digital Pass Generator
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff9933] mt-2">
                Offline Pass Processing Engine
              </p>
            </div>

            {/* Config & Download Buttons */}
            <div className="flex flex-wrap gap-3">
              {excelData.length > 0 && (
                <>
                  <button
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#138808] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#138808]/15 hover:bg-[#19a50a] transition-all"
                  >
                    <Download className="h-4 w-4" /> Download Updated Excel
                  </button>

                  <button
                    onClick={handleGenerateAllPasses}
                    disabled={isGenerating || isGeneratingAll}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all ${
                      isGeneratingAll
                        ? 'bg-yellow-600 shadow-yellow-600/15 cursor-not-allowed'
                        : 'bg-[#ff9933] shadow-[#ff9933]/15 hover:bg-[#ffaa4d]'
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${isGeneratingAll ? 'animate-spin' : ''}`} />
                    {isGeneratingAll 
                      ? `Generating All (${currentAllIndex}/${excelData.length})...` 
                      : `Generate All Passes (${excelData.length} records)`}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Grid Layout: Main Panel & Preview Panel */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            
            {/* LEFT PANEL: Uploader & Data Table (Span 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Excel Upload Area */}
              <div className="rounded-3xl border border-white/10 bg-[#081224]/30 p-8 text-center backdrop-blur-md relative overflow-hidden group">
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  id="excel-uploader"
                  className="hidden"
                />
                <label 
                  htmlFor="excel-uploader"
                  className="flex flex-col items-center justify-center cursor-pointer py-4"
                >
                  <div className="h-16 w-16 rounded-2xl bg-[#ff9933]/10 border border-[#ff9933]/30 flex items-center justify-center text-[#ff9933] group-hover:scale-110 transition-transform duration-300 mb-4">
                    <FileSpreadsheet className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white mb-2">Upload Registrants Excel Sheet</h3>
                  <p className="text-xs text-white/50 max-w-sm leading-relaxed mb-4">
                    Select a spreadsheet containing Name, Mobile Number, City, Pass Count, and Additional Participants.
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-white/80 border border-white/10 hover:bg-white/10 transition-all">
                    <Upload className="h-3.5 w-3.5" /> Choose Excel File
                  </span>
                </label>

                {fileName && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-sm text-green-400 font-semibold">
                    <CheckCircle className="h-4 w-4" /> {fileName}
                  </div>
                )}
              </div>

              {/* Data Table Panel */}
              {excelData.length > 0 && (
                <div className="rounded-3xl border border-white/10 bg-[#081224]/30 backdrop-blur-md overflow-hidden flex flex-col">
                  
                  {/* Table Toolbar Search */}
                  <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:max-w-xs">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search by name, phone, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-white/30 text-white focus:outline-none focus:border-[#ff9933] transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
                        Next Pass Seq:
                      </span>
                      <input 
                        type="number"
                        min="1"
                        value={startingPassSeq}
                        onChange={(e) => setStartingPassSeq(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-[#ff9933] font-bold text-center focus:outline-none focus:border-[#ff9933]"
                      />
                    </div>
                  </div>

                  {/* Table wrapper */}
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-white/70">
                          <th className="py-4 px-5">Name & City</th>
                          <th className="py-4 px-5">Mobile</th>
                          <th className="py-4 px-5 text-center">Passes</th>
                          <th className="py-4 px-5">Pass Numbers</th>
                          <th className="py-4 px-5 text-center">Status</th>
                          <th className="py-4 px-5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredData.map((row, index) => {
                          const realIdx = excelData.findIndex(r => r.name === row.name && r.mobile === row.mobile);
                          const isSelected = realIdx === selectedRowIndex;

                          return (
                            <tr 
                              key={index} 
                              onClick={() => {
                                setSelectedRowIndex(realIdx);
                                setSelectedPassIndex(0);
                              }}
                              className={`cursor-pointer transition-all hover:bg-white/5 ${
                                isSelected ? 'bg-[#ff9933]/5 text-white' : 'text-white/80'
                              }`}
                            >
                              <td className="py-4 px-5">
                                <div className="font-semibold text-white">{row.name}</div>
                                <div className="text-xs text-white/50">{row.city || 'Ahmedabad'}</div>
                              </td>
                              <td className="py-4 px-5 font-mono text-xs">{row.mobile}</td>
                              <td className="py-4 px-5 text-center font-bold text-white/90">{row.passCount}</td>
                              <td className="py-4 px-5 font-mono text-xs text-[#e7c27d]">
                                {row.passNumber ? (
                                  <span className="truncate block max-w-[150px]">{row.passNumber}</span>
                                ) : (
                                  <span className="text-white/20">—</span>
                                )}
                              </td>
                              <td className="py-4 px-5 text-center">
                                <span className={`inline-flex px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-md ${
                                  row.passGenerated === 'YES' 
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                  {row.passGenerated === 'YES' ? 'Generated' : 'Pending'}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => clickGeneratePass(realIdx)}
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all ${
                                    row.passGenerated === 'YES'
                                      ? 'bg-white/5 text-white hover:bg-white/10'
                                      : 'bg-[#ff9933] text-white hover:bg-[#ffaa4d]'
                                  }`}
                                >
                                  {row.passGenerated === 'YES' ? 'Re-Gen' : 'Generate'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredData.length === 0 && (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-white/40">
                              No matching registrants found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Counter */}
                  <div className="p-4 border-t border-white/5 bg-white/2px text-xs text-white/40 font-semibold flex justify-between items-center">
                    <span>Total Loaded: {excelData.length} records</span>
                    <span>Generated: {excelData.filter(r => r.passGenerated === 'YES').length} passes</span>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: Live Interactive Preview (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {selectedRow ? (
                <div className="rounded-3xl border border-white/10 bg-[#081224]/30 p-6 backdrop-blur-md flex flex-col gap-6 relative">
                  
                  {/* Title & Preview Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-[#ff9933]" /> Live Pass Preview
                      </h3>
                      <p className="text-xs text-white/50 mt-1 truncate max-w-[200px]">
                        Previewing {selectedRow.name}
                      </p>
                    </div>

                    <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs font-semibold">
                      <button
                        onClick={() => setPreviewSide("front")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          previewSide === 'front' ? 'bg-[#ff9933] text-white' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Front Side
                      </button>
                      <button
                        onClick={() => setPreviewSide("back")}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          previewSide === 'back' ? 'bg-[#ff9933] text-white' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Back Side
                      </button>
                    </div>
                  </div>

                  {/* Pass Selector (for bookings with multiple counts) */}
                  {selectedRow.passCount > 1 && (
                    <div className="flex flex-col gap-2 bg-white/2px p-4 rounded-2xl border border-white/5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
                        Select Ticket Holder:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {participantList.map((pName, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => setSelectedPassIndex(pIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                              selectedPassIndex === pIdx 
                                ? 'bg-[#ff9933]/15 text-[#ff9933] border-[#ff9933]/30' 
                                : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'
                            }`}
                          >
                            Pass {pIdx + 1}: {pName.length > 15 ? `${pName.slice(0, 15)}...` : pName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive zoom widget controls */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-white/60 font-bold uppercase">Zoom Controls</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setZoom(z => Math.max(0.2, z - 0.05))}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/80"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-mono text-[#ff9933] font-bold">{Math.round(zoom * 100)}%</span>
                      <button 
                        onClick={() => setZoom(z => Math.min(1.0, z + 0.05))}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/80"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Render Area with scale wrapping */}
                  <div className="relative flex justify-center items-center border border-white/10 rounded-2xl bg-[#02050a] p-4 overflow-hidden h-[420px] max-w-full">
                    
                    {/* Floating Zoom Wrapper */}
                    <div 
                      style={{ 
                        width: `${2484 * zoom}px`, 
                        height: `${1128 * zoom}px`, 
                        position: 'relative'
                      }}
                      className="select-none pointer-events-none"
                    >
                      <div
                        style={{
                          width: '2484px',
                          height: '1128px',
                          transform: `scale(${zoom})`,
                          transformOrigin: 'top left',
                          position: 'absolute',
                          left: 0,
                          top: 0
                        }}
                      >
                        <PassCard 
                          name={participantList[selectedPassIndex] || selectedRow.name} 
                          mobile={selectedRow.mobile} 
                          city={selectedRow.city} 
                          passNumber={
                            selectedRow.passNumber
                              ? (selectedRow.passCount === 1 
                                  ? selectedRow.passNumber 
                                  : formatPassNumber(parsePassSeq(selectedRow.passNumber.split(/\s+to\s+/i)[0]) + selectedPassIndex))
                              : `PVC-2026-${startingPassSeq.toString().padStart(6, '0')}`
                          }
                          scale={1} 
                          activeSide={previewSide}
                          previewMode={true}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="rounded-3xl border border-white/5 bg-[#081224]/10 p-12 text-center text-white/35 flex flex-col items-center justify-center h-[500px]">
                  <FileText className="h-12 w-12 text-white/20 mb-4 animate-pulse" />
                  <p className="font-serif font-bold text-lg text-white/50">No Row Selected</p>
                  <p className="text-xs text-white/30 max-w-xs mt-1 leading-relaxed">
                    Upload an Excel file and select a registrant row to view live rendering preview.
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Hidden Container for offscreen high-res pass rendering & capture */}
        <div className="absolute top-0 left-0 -z-50 overflow-hidden pointer-events-none" style={{ width: '3000px', height: '3000px' }}>
          <div ref={offscreenRenderRef} className="relative w-full h-full">
            {renderProps && (
              <>
                {/* Front Side Render Target (forced absolute at 0,0) */}
                <div className="absolute top-0 left-0" style={{ width: '2484px', height: '1128px' }}>
                  <PassCard 
                    name={renderProps.name} 
                    mobile={renderProps.mobile} 
                    city={renderProps.city} 
                    passNumber={renderProps.passNumber} 
                    scale={1} 
                    activeSide="front"
                  />
                </div>
                {/* Back Side Render Target (forced absolute at 1200px down) */}
                <div className="absolute top-[1200px] left-0" style={{ width: '2484px', height: '1128px' }}>
                  <PassCard 
                    name={renderProps.name} 
                    mobile={renderProps.mobile} 
                    city={renderProps.city} 
                    passNumber={renderProps.passNumber} 
                    scale={1} 
                    activeSide="back"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5">
          <EventFooter />
        </div>
      </main>
    </>
  );
}

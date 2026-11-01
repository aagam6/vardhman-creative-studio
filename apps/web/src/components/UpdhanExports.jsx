import React,{useEffect,useState} from 'react';
import {exportRecord,columns,exportFailure} from '@/lib/updhanExports';
export default function UpdhanExports({api,selection,filters,total,detail,disabled}){
 const [progress,setProgress]=useState(''),[running,setRunning]=useState(false),[pending,setPending]=useState(null);
 useEffect(()=>setPending(null),[selection,filters,detail]);
 async function run(format,scope){
  if(running)return;
  const expected=scope==='single'?1:scope==='selected'?selection.length:total;
  if(!expected||expected>500){setProgress('एक बार में 1–500 आवेदन export करें। Filters से सूची छोटी करें।');return;}
  setPending(null);
  setRunning(true);setProgress('Export तैयार हो रहा है…');let mount;const imageUrls=[];
  try{
   let ids=scope==='single'?[detail.id]:[...selection];
   if(scope==='filtered'){
    ids=[];for(let page=1;ids.length<expected;page++){
     const batch=await api.list({...filters,page});
     if(batch.total!==expected)throw Error('सूची बदल गई है। Refresh करके फिर export करें।');
     ids.push(...batch.items.map(r=>r.id));if(!batch.items.length)break;
    }
    if(new Set(ids).size!==expected)throw Error('सूची बदल गई है। Refresh करके फिर export करें।');
   }
   const records=[];
   for(const id of ids){records.push(await api.detail(id));setProgress(`${records.length}/${ids.length} आवेदन पढ़े गए`);}
   const stamp=new Date().toISOString().slice(0,10),filename=scope==='single'?records[0].reference:`Updhan-${stamp}-${records.length}`;
   if(format==='excel'){
    const XLSX=await import('xlsx');const sheet=XLSX.utils.json_to_sheet(records.map(exportRecord));
    // Force literal string cells: applicant content is never an Excel formula.
    for(const [address,cell] of Object.entries(sheet))if(!address.startsWith('!')){cell.t='s';delete cell.f;}
    sheet['!cols']=columns.map(()=>({wch:28}));const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,'Applications');XLSX.writeFile(book,filename+'.xlsx');
   }else{
    const {toJpeg}=await import('html-to-image');const {jsPDF}=await import('jspdf');const pdf=new jsPDF({unit:'mm',format:'a4',compress:true});
    mount=document.createElement('div');mount.style.cssText='position:fixed;left:-10000px;top:0;width:794px;background:white;color:#173d32;padding:42px;box-sizing:border-box;font:16px "Noto Sans Devanagari","Noto Sans Gujarati","Nirmala UI",sans-serif;';document.body.appendChild(mount);
    await document.fonts.ready;
    let pageCount=0;
    const savePage=async()=>{
     const data=await toJpeg(mount,{pixelRatio:1.7,quality:0.9,backgroundColor:'#ffffff',cacheBust:false,style:{position:"static",left:"auto",top:"auto",margin:"0"}});
     if(pageCount++)pdf.addPage();pdf.addImage(data,'JPEG',0,0,210,mount.scrollHeight*210/794);
    };
    for(let i=0;i<records.length;i++){
     const r=records[i];
     const header=()=>{
      mount.replaceChildren();const title=document.createElement('h1');title.textContent='विजयपताका – उपधान महोत्सव';title.style.cssText='font-size:27px;line-height:1.5;margin:0 0 12px';mount.append(title);
      const subtitle=document.createElement('p');subtitle.textContent=`अचलगढ़, राजस्थान · ${r.reference} · ${r.status}`;mount.append(subtitle);const dates=document.createElement('p');dates.textContent='प्रथम प्रवेश: 25 अप्रैल 2027 · मालारोपण: 14 जून 2027';dates.style.fontSize='13px';mount.append(dates);
     };
     header();
     if(r.status!=='trashed'){
      const response=await fetch(`/api/updhan/admin/photo/${encodeURIComponent(r.id)}`,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(20000)});
      if(response.status===401)throw Error('Session समाप्त हो गया। फिर login करके export करें।');
      if(!response.ok)throw Error(`${r.reference}: फोटो उपलब्ध नहीं है (${response.status})। PDF नहीं बनाया गया।`);
      const blob=await response.blob();const image=document.createElement('img');image.src=URL.createObjectURL(blob);imageUrls.push(image.src);image.style.cssText='width:100px;height:125px;object-fit:contain;display:block;margin:0 0 18px';await image.decode();mount.append(image);
     }
     const rows=[...Object.entries(exportRecord(r)),['नोट / Note','आवेदन प्राप्ति प्रवेश की स्वीकृति नहीं है। Restricted health details are excluded.']];
     for(const [label,value] of rows){
      const row=document.createElement('div');row.style.cssText='border-bottom:1px solid #d6e1db;padding:9px 0;overflow-wrap:anywhere;line-height:1.6';const strong=document.createElement('strong');strong.textContent=label+': ';row.append(strong,document.createTextNode(value||'—'));mount.append(row);
      if(mount.scrollHeight>1080){row.remove();await savePage();header();mount.append(row);}
     }
     await savePage();setProgress(`${i+1}/${records.length} PDF forms तैयार`);
    }
    pdf.save(filename+'.pdf');
   }
   setProgress(`${records.length} आवेदन export हुए। Health details शामिल नहीं हैं।`);
  }catch(error){setProgress(exportFailure(error));}finally{mount?.remove();for(const url of imageUrls)URL.revokeObjectURL(url);setRunning(false);}
 }
 return <section className="um-panel"><h2>फॉर्म Export / Excel & PDF</h2><p>Excel में सभी सामान्य विवरण। PDF में भरा हुआ फॉर्म और फोटो। निजी health details शामिल नहीं हैं। All filtered में सभी pages शामिल हैं (अधिकतम 500)।</p><div className="um-tools">{['excel','pdf'].map(format=><React.Fragment key={format}><button disabled={disabled||running||!detail} onClick={()=>setPending({format,scope:'single',count:1})}>यह फॉर्म · {format.toUpperCase()}</button><button disabled={disabled||running||!selection.length} onClick={()=>setPending({format,scope:'selected',count:selection.length})}>Selected ({selection.length}) · {format.toUpperCase()}</button><button disabled={disabled||running||!total||total>500} onClick={()=>setPending({format,scope:'filtered',count:total})}>All filtered ({total}) · {format.toUpperCase()}</button></React.Fragment>)}</div>{pending&&<div className="um-export-confirm"><p>{pending.count} आवेदन · {pending.format.toUpperCase()} · निजी जानकारी केवल अधिकृत उपयोग के लिए रखें।</p><button disabled={running} onClick={()=>run(pending.format,pending.scope)}>Download export</button><button onClick={()=>setPending(null)}>Cancel</button></div>}<p role="status" aria-live="polite">{progress}</p></section>;
}

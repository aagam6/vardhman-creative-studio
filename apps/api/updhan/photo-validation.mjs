import {UpdhanError} from './errors.mjs';

export function createPhotoDecoder(sharp) {
 return async photo=>{
  if(!photo||!['image/jpeg','image/png','image/webp'].includes(photo.mime)||!Buffer.isBuffer(photo.bytes)||photo.bytes.length>2097152||photo.bytes.length<12)throw new UpdhanError(400,'JPG, PNG or WEBP up to 2 MB required');
  try{
   const image=sharp(photo.bytes,{limitInputPixels:24000000,failOn:'warning',animated:false});
   const meta=await image.metadata();
   if(!['jpeg','png','webp'].includes(meta.format)||`image/${meta.format==='jpeg'?'jpeg':meta.format}`!==photo.mime||meta.width<100||meta.height<100||(meta.pages||1)>1)throw new Error('Invalid image');
   // Decode, orient, resize, re-encode; metadata is omitted by default.
   return await image.rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).jpeg({quality:88}).toBuffer();
  }catch{throw new UpdhanError(400,'Photo is invalid, truncated, too small or exceeds 24 MP');}
 };
}

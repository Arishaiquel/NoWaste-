"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ReceiptExtraction } from "@/schemas/receipt";

type Result = { receiptId: string; purchaseDate: string; extraction: ReceiptExtraction };
export function ReceiptUpload({ guestDemo = false }: { guestDemo?: boolean }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [result, setResult] = useState<Result|null>(null); const [done, setDone] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false); const [stream, setStream] = useState<MediaStream|null>(null); const [selectedFile, setSelectedFile] = useState<File|null>(null); const [capturedFile, setCapturedFile] = useState<File|null>(null); const [capturedPreview, setCapturedPreview] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null); const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{if(stream&&videoRef.current){videoRef.current.srcObject=stream;void videoRef.current.play()}return()=>{stream?.getTracks().forEach((track)=>track.stop())}},[stream]);
  async function openCamera() {
    setError(""); setSelectedFile(null); setCapturedFile(null); setCapturedPreview("");
    if (!navigator.mediaDevices?.getUserMedia) { setError("This browser does not support camera capture. Choose an image instead."); return; }
    try { const nextStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});setCameraOpen(true);setStream(nextStream); }
    catch { setError("Camera access was not available. Allow camera permission or choose an image instead."); }
  }
  function closeCamera() { stream?.getTracks().forEach((track)=>track.stop());setStream(null);setCameraOpen(false); }
  function capturePhoto() {
    const video=videoRef.current;const canvas=canvasRef.current;if(!video||!canvas)return;
    canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext("2d")?.drawImage(video,0,0);
    canvas.toBlob((blob)=>{if(!blob){setError("Could not capture the photo. Please try again.");return}setCapturedFile(new File([blob],`receipt-${Date.now()}.jpg`,{type:"image/jpeg"}));setCapturedPreview(canvas.toDataURL("image/jpeg",.9));closeCamera()},"image/jpeg",.9);
  }
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setDone(false);
    if (guestDemo) {
      setResult({ receiptId: "guest-demo", purchaseDate: new Date().toISOString().slice(0, 10), extraction: { store_name: "Demo Grocer", purchase_date: new Date().toISOString().slice(0, 10), currency: "SGD", items: [
        { raw_receipt_name: "BABY SPINACH", normalized_name: "Baby spinach", brand: null, quantity: 1, unit: "pack", price: 3.8, food_category: "leafy_vegetables", perishable: true, confidence: .97, needs_review: false },
        { raw_receipt_name: "CHKN BRST", normalized_name: "Chicken breast", brand: null, quantity: 1, unit: "pack", price: 8.9, food_category: "raw_poultry", perishable: true, confidence: .88, needs_review: false },
        { raw_receipt_name: "FULL CRM MILK", normalized_name: "Full cream milk", brand: null, quantity: 1, unit: "bottle", price: 4.2, food_category: "dairy", perishable: true, confidence: .93, needs_review: false },
      ] } });
      setBusy(false); return;
    }
    const formData=new FormData(event.currentTarget);if(capturedFile)formData.set("receipt",capturedFile);
    const response = await fetch("/api/receipts/upload", { method: "POST", body: formData });
    const data = await response.json().catch(()=>({})) as Result & { error?: string };
    if (response.ok) setResult(data); else setError(data.error ?? "Upload failed"); setBusy(false);
  }
  async function confirm() {
    if (!result) return; setBusy(true); setError("");
    if (guestDemo) { setDone(true); setResult(null); setBusy(false); return; }
    const response = await fetch("/api/receipts/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ receiptId: result.receiptId }) });
    const data = await response.json().catch(()=>({})) as { error?: string };
    if (response.ok) { setDone(true); setResult(null); } else setError(data.error ?? "Confirmation failed"); setBusy(false);
  }
  return <div className="mt-8 max-w-2xl">
    {!result && !done && <form onSubmit={upload} className="card p-6"><label htmlFor="receipt" className="block font-black">Take or choose a receipt photo</label><p className="mt-1 text-sm text-[#68766e]">Use your phone or computer camera, or choose an existing JPG, PNG, or WebP image up to 8 MB.</p>
      {!cameraOpen&&!capturedPreview&&<div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={openCamera} className="button bg-[#229ed9] text-white">📷 Use camera</button><label className="button cursor-pointer border border-[#164b3540] bg-white text-[#164b35]">{selectedFile?selectedFile.name:"Choose image"}<input id="receipt" name="receipt" type="file" accept="image/*" required={!capturedFile} onChange={(event)=>{setSelectedFile(event.target.files?.[0]??null);setCapturedFile(null);setCapturedPreview("")}} className="sr-only"/></label></div>}
      {cameraOpen&&<div className="mt-5 overflow-hidden rounded-2xl bg-black p-3"><video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full rounded-xl object-cover"/><div className="mt-3 flex justify-center gap-3"><button type="button" onClick={closeCamera} className="button bg-white/15 text-white">Cancel</button><button type="button" onClick={capturePhoto} className="button bg-white text-[#164b35]">Take photo</button></div></div>}
      {capturedPreview&&<div className="mt-5"><Image src={capturedPreview} alt="Captured receipt preview" width={1200} height={900} unoptimized className="max-h-[28rem] w-full rounded-2xl bg-black object-contain"/><button type="button" onClick={()=>{setCapturedFile(null);setCapturedPreview("")}} className="button mt-3 border">Retake or choose another</button></div>}
      <canvas ref={canvasRef} className="hidden"/><button disabled={busy||cameraOpen||(!capturedFile&&!selectedFile&&!guestDemo)} className="button mt-5 bg-[#164b35] text-white disabled:opacity-50">{busy ? "Reading receipt…" : "Review receipt"}</button></form>}
    {result && <div className="card p-6"><p className="eyebrow">Review before adding</p><h2 className="mt-2 text-2xl font-black">{result.extraction.items.length} groceries found</h2><p className="mt-2 text-sm text-[#68766e]">Purchase date: {result.purchaseDate}</p><ul className="mt-5 divide-y">{result.extraction.items.map((item,index)=><li key={`${item.raw_receipt_name}-${index}`} className="flex items-center justify-between gap-3 py-3"><span><b>{item.normalized_name}</b><small className="block text-[#68766e]">Receipt: {item.raw_receipt_name}</small></span>{(item.needs_review||item.confidence<.75)&&<span className="rounded-full bg-[#fff0d7] px-2 py-1 text-xs font-black">Review</span>}</li>)}</ul><div className="mt-5 flex gap-3"><button onClick={()=>setResult(null)} className="button border">Cancel</button><button onClick={confirm} disabled={busy} className="button bg-[#164b35] text-white disabled:opacity-50">{busy ? "Adding…" : "Add to pantry"}</button></div></div>}
    {done && <div className="card p-6"><h2 className="text-2xl font-black">Groceries added ✓</h2><p className="mt-2 text-[#526259]">{guestDemo ? "Demo complete—guest changes are temporary." : "Your receipt is now in your private kitchen."}</p><a href="/dashboard" className="button mt-5 bg-[#164b35] text-white">Open kitchen</a></div>}
    {error && <p role="alert" className="mt-4 font-bold text-[#a63328]">{error}</p>}
  </div>;
}


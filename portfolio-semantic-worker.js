import {pipeline, env} from './vendor/transformers.min.js';
env.allowRemoteModels=false;
env.allowLocalModels=true;
env.localModelPath=new URL('./models/',import.meta.url).href;
env.backends.onnx.wasm.wasmPaths=new URL('./vendor/',import.meta.url).href;
env.backends.onnx.wasm.numThreads=1;
let encoder, facts, vectors;
self.onmessage=async ({data:m})=>{
 try {
  if(m.type==='init'){
   facts=m.facts;
   encoder=await pipeline('feature-extraction','all-MiniLM-L6-v2',{device:'wasm',dtype:'q8'});
   vectors=(await encoder(facts.map(f=>f.title+'. '+f.text),{pooling:'mean',normalize:true})).tolist();
   self.postMessage({type:'ready'});
  }else if(m.type==='search'){
   const q=(await encoder(m.query,{pooling:'mean',normalize:true})).tolist()[0];
   const results=vectors.map((v,i)=>({id:facts[i].id,score:v.reduce((sum,x,j)=>sum+x*q[j],0)})).sort((a,b)=>b.score-a.score);
   self.postMessage({type:'results',id:m.id,results});
  }
 }catch(e){self.postMessage({type:'error',id:m.id,message:String(e.message||e)});}
};

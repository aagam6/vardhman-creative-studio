import React,{createContext,useContext,useState} from 'react';
import {translateUpdhan} from '@/lib/updhanTranslations';
const LanguageContext=createContext({language:'hi',setLanguage:()=>{}});
const preferenceKey='updhan-language';
export function UpdhanLanguageProvider({children}){
 const [language,setValue]=useState(()=>{try{const value=localStorage.getItem(preferenceKey);return ['hi','en','gu'].includes(value)?value:'hi';}catch{return 'hi';}});
 function setLanguage(value){if(!['hi','en','gu'].includes(value))return;setValue(value);try{localStorage.setItem(preferenceKey,value);}catch{/* The selection still works when storage is unavailable. */}}
 return <LanguageContext.Provider value={{language,setLanguage}}>{children}</LanguageContext.Provider>;
}
export function useUpdhanLanguage(){const context=useContext(LanguageContext);return {...context,t:value=>translateUpdhan(value,context.language)};}
export function UpdhanLanguageButtons(){const {language,setLanguage}=useUpdhanLanguage();return <div className="vp-language" role="group" aria-label="Language / भाषा / ભાષા">{[['hi','हिन्दी'],['en','English'],['gu','ગુજરાતી']].map(([code,label])=><button data-updhan-track={'language_'+code} type="button" key={code} lang={code} aria-pressed={language===code} onClick={()=>setLanguage(code)}>{label}</button>)}</div>;}
// Translate React text and accessible labels before rendering; never alter inputs,
// handlers, canonical field values, or user-entered review values.
export function localizeUpdhanTree(node,language){
 if(typeof node==='string')return translateUpdhan(node,language);
 if(Array.isArray(node))return node.map(child=>localizeUpdhanTree(child,language));
 if(!React.isValidElement(node)||node.props['data-updhan-original']||['script','style'].includes(node.type))return node;
 const props={};for(const name of ['alt','title','aria-label','placeholder','content'])if(typeof node.props[name]==='string')props[name]=translateUpdhan(node.props[name],language);
 if(node.props.lang && ['hi','gu','en'].includes(node.props.lang))props.lang=language;
 if(node.props.children!==undefined)props.children=localizeUpdhanTree(node.props.children,language);
 return React.cloneElement(node,props);
}
export function UpdhanLocalized({children}){const {language}=useUpdhanLanguage();return localizeUpdhanTree(children,language);}

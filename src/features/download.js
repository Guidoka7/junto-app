import {Capacitor,registerPlugin} from '@capacitor/core';

export async function saveDownload(value,name){
  try{
    const contents=JSON.stringify(value,null,2);
    if(Capacitor.isNativePlatform()){
      const result=await registerPlugin('BankNotifications').exportFile({name,contents});
      if(result.saved)window.JuntoApp?.toast('Cópia salva.');
      return Boolean(result.saved);
    }
    const blob=new Blob([contents],{type:'application/json'}),url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
  }catch(error){window.JuntoApp?.toast('Não foi possível exportar.',error.message||'Escolha outro destino e tente novamente.');return false;}
}

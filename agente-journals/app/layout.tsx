import type { Metadata } from "next";
export const metadata:Metadata={title:"Agente Journals",description:"Centro de producción científica y literaria"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body style={{fontFamily:"system-ui,Arial",margin:0,background:"#f6f8fc",color:"#17233c"}}>{children}</body></html>}

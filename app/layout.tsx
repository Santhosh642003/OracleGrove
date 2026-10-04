import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Oracle Grove — This choice is yours",description:"A quiet, illustrated storybook to explore a choice with three thoughtful woodland friends.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}

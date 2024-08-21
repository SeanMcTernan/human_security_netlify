import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <main className="container mx-auto px-8">
        <div className="py-20">
          <h1 className="font-bold text-3xl text-center">
            <img src="/logo.svg" alt="Netlify - Fullstack Demo" className="w-40 inline-block" />
          </h1>
        </div>

        <div className="bg-slate-100 p-12 rounded-xl">
          <h2 className="text-2xl mb-12">
           Human Security Demo
          </h2>
          <p>This page is protected with Human Security Bot Protection</p>
        </div>
      </main>
    </>
  )
}

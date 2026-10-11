import React from 'react'
import { Satellite, Sprout } from 'lucide-react'

const badges = ['EU LUCAS', 'Random Forest', 'R² = 0.78']

const Header = () => {
  return (
    <header className="mx-auto w-full max-w-3xl px-4 pt-8">
      {/* Tinted, top-heavy gradient that fades out downward. No blur: the topo lines stay crisp through the card. */}
      <div className="flex flex-col items-center rounded-[2rem] bg-gradient-to-b from-[#1b4d35]/[0.08] via-[#1b4d35]/[0.04] to-transparent px-6 pb-12 pt-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1b4d35] shadow-lg shadow-emerald-950/20">
          {/* <Satellite className="h-6 w-6 text-white" aria-hidden="true" /> */}
          <Sprout className="h-6 w-6 text-white" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-7xl font-extrabold tracking-tight text-[#1b4d35]">
          VARIA
        </h1>

        <p className="mt-3.5 text-xl font-semibold text-gray-900">
          AI Soil Carbon <span className="text-[#c4a24a]">Screening</span>
        </p>

        <p className="mt-4 max-w-xl text-base leading-6 text-gray-500">
          Preliminary SOC estimation using satellite data and machine learning.
          <br className="hidden sm:block" />
          Trained on EU LUCAS Soil Database.
        </p>

        <ul className="mt-5 flex flex-wrap justify-center gap-3">
          {badges.map((badge) => (
            <li
              key={badge}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-[#1b4d35]"
            >
              {badge}
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}

export default Header
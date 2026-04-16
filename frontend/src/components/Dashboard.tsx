"use client";

import { Navbar } from "./Navbar";
import { StatusHeader } from "./StatusHeader";
import { InfoCard } from "./InfoCard";
import { ProofOfLifeCard } from "./ProofOfLifeCard";
import { InheritanceCard } from "./InheritanceCard";

export function Dashboard() {
  return (
    <>
      <Navbar />

      <main className="flex-1 px-[5%] py-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
        <StatusHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <InfoCard />
          <ProofOfLifeCard />
          <InheritanceCard />
        </div>
      </main>
    </>
  );
}

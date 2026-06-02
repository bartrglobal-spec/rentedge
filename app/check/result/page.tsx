'use client'

import { useSearchParams } from "next/navigation";

export default function UnlockPage() {
  const params = useSearchParams();

  const getNumber = (value: string | null) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // -------------------------
  // PROPERTY
  // -------------------------
  const property = {
    rent: getNumber(params.get("rent1")),
    bedrooms: getNumber(params.get("bedrooms1")),
    label: params.get("location1") || "this property",
  };

  // -------------------------
  // RENTER
  // -------------------------
  const renter = {
    income: getNumber(params.get("income")),
    employment: params.get("employment") || "",
    duration: params.get("duration") || "",
    occupants: getNumber(params.get("occupants")),
    deposit: params.get("deposit") || "",
  };

  // -------------------------
  // ENGINE (MATCH RESULT PAGE)
  // -------------------------
  const blockers: string[] = [];
  const fixes: string[] = [];

  const rentRatio = renter.income > 0 ? property.rent / renter.income : 1;

  if (rentRatio > 0.4) {
    blockers.push("Income is too tight for this rent");
    fixes.push("Target a lower rent or strengthen financial proof");
  } else if (rentRatio > 0.3) {
    fixes.push("Affordability is borderline — address this upfront");
  }

  if (renter.occupants > property.bedrooms * 2) {
    blockers.push("Too many occupants for the property size");
    fixes.push("Clarify living arrangement to avoid rejection");
  }

  if (
    renter.employment.toLowerCase().includes("contract") ||
    renter.duration.length < 1
  ) {
    fixes.push("Employment stability may be questioned — clarify this");
  }

  if (renter.deposit === "Not ready yet") {
    blockers.push("Deposit not ready");
    fixes.push("Confirm deposit availability before applying");
  }

  // -------------------------
  // STATUS
  // -------------------------
  let status = "ready";
  if (blockers.length > 0) status = "not_ready";
  else if (fixes.length > 0) status = "almost";

  // -------------------------
  // 🔥 KILLER MOVE (RISK-AWARE)
  // -------------------------
  let killerMove = "";

  if (blockers.includes("Deposit not ready")) {
    killerMove = "Do not apply yet — secure your deposit first or you will be filtered out immediately.";
  } else if (blockers.length > 0) {
    killerMove = "Fix the critical issues below before applying — otherwise you will likely be rejected.";
  } else if (status === "almost") {
    killerMove = "Apply now, but address the risks clearly in your message to avoid hesitation.";
  } else {
    killerMove = "Apply immediately with a complete application — speed will give you the edge.";
  }

  // -------------------------
  // APPLICATION PACKAGE
  // -------------------------
  const depositLine =
    renter.deposit === "2 months deposit ready"
      ? "2 months deposit ready"
      : renter.deposit === "1 month deposit ready"
      ? "Full deposit ready"
      : "Deposit plan in place";

  const applicationPackage = `Property: ${property.label}

Income: R${renter.income}
Employment: ${renter.employment} (${renter.duration})
Occupants: ${renter.occupants}
Deposit: ${depositLine}

Documents ready:
• ID copy
• Latest payslip
• 3 months bank statements
• Proof of deposit`;

  // -------------------------
  // MESSAGE (RISK-AWARE)
  // -------------------------
  let messageIntro = `Hi,

I'm applying for the ${property.label}.`;

  let riskLine = "";

  if (rentRatio > 0.3 && rentRatio <= 0.4) {
    riskLine = "I’d like to address affordability upfront — my income comfortably supports this rental.";
  }

  if (renter.deposit === "Not ready yet") {
    riskLine = "I am finalizing my deposit and can confirm availability shortly.";
  }

  if (renter.occupants > property.bedrooms * 2) {
    riskLine = "I’d like to clarify the occupancy arrangement to avoid any concerns.";
  }

  const message = `${messageIntro}

I can submit a complete application immediately.

• Income: R${renter.income} (${renter.employment})
• ${renter.duration} employment stability
• ${renter.occupants} occupants
• ${depositLine}

${riskLine}

All documents are ready and can be sent through immediately.

I’m ready to proceed without delays.

Please share the next step.`;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-[#0b1f3a]">
          Your application strategy
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          This is how to avoid rejection and move forward faster
        </p>
      </div>

      {/* STATUS */}
      <div className={`rounded-2xl p-5 text-white ${
        status === "ready"
          ? "bg-green-600"
          : status === "almost"
          ? "bg-yellow-500"
          : "bg-red-600"
      }`}>
        <p className="text-sm font-semibold">
          {status === "ready"
            ? "Ready to apply"
            : status === "almost"
            ? "Apply with caution"
            : "Not ready to apply"}
        </p>
        <p className="text-sm mt-1">
          {killerMove}
        </p>
      </div>

      {/* BLOCKERS */}
      {blockers.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-5">
          <p className="text-sm font-semibold text-red-700">
            Fix this first
          </p>
          {blockers.map((b, i) => (
            <p key={i} className="text-sm text-red-700">
              • {b}
            </p>
          ))}
        </div>
      )}

      {/* FIXES */}
      {fixes.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#0b1f3a]">
            What to improve
          </p>
          {fixes.map((f, i) => (
            <p key={i} className="text-sm text-slate-700">
              • {f}
            </p>
          ))}
        </div>
      )}

      {/* PACKAGE */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-[#0b1f3a]">
          Your application (ready to send)
        </p>

        <div className="bg-slate-50 p-4 rounded-xl text-sm whitespace-pre-line">
          {applicationPackage}
        </div>
      </div>

      {/* MESSAGE */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-[#0b1f3a]">
          Copy and send immediately
        </p>

        <div className="bg-slate-50 p-4 rounded-xl text-sm whitespace-pre-line">
          {message}
        </div>

        <button
          onClick={() => navigator.clipboard.writeText(message)}
          className="w-full bg-[#ff6a00] text-white py-3 rounded-xl text-sm font-semibold"
        >
          Copy message
        </button>
      </div>

    </div>
  );
}
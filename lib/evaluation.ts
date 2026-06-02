import {
  getAffordabilityThresholds,
  getBufferLevel,
  getCleanPropertyName,
  getDemandLevel,
  getIncomeBand,
  getLikelyApplicantPool,
  getOccupancyStatus,
  getPropertyClass,
  normalizeText,
  uniqueStrings,
} from "./evaluation/helpers"

import {
  PropertyEvaluation,
  PropertyInput,
  RenterProfile,
} from "./evaluation/types"

import { getFinancialRank } from "./evaluation/scoring"
import { evaluatePressure } from "./evaluation/pressure"
import { getFeeRisk } from "./evaluation/risk/fee-risk"
import { getProbableOutcome } from "./evaluation/risk/outcome"
import { getRecommendedRentRange } from "./evaluation/risk/rent-range"

export function evaluateProperty(
  renter: RenterProfile,
  property: PropertyInput
): PropertyEvaluation {

  const propertyClass =
    getPropertyClass(property)

  const propertyName =
    getCleanPropertyName(property)

  const totalIncome =
    (renter.income || 0) +
    (renter.additionalIncome || 0)

  const rent =
    Math.max(property.rent || 1, 1)

  const affordabilityRatio =
    totalIncome / rent

  const rentBurden =
    Math.round(
      (rent / Math.max(totalIncome, 1)) * 100
    )

  const bufferAmount =
    totalIncome - rent

  const bufferLevel =
    getBufferLevel(bufferAmount)

  const incomeBand =
    getIncomeBand(totalIncome)

  const demand =
    property.demand ||
    getDemandLevel(property)

  const applicantPool =
    getLikelyApplicantPool(
      propertyClass
    )

  const occupancyStatus =
    getOccupancyStatus(
      renter.occupants,
      property.bedrooms,
      propertyClass
    )

  const thresholds =
    getAffordabilityThresholds(
      propertyClass
    )

  const financialStrength =
    getFinancialRank(
      affordabilityRatio,
      thresholds,
      bufferLevel,
      incomeBand,
      renter.employment,
      propertyClass,
      applicantPool
    )

  const docsReady =
    renter.idReady &&
    renter.payslipReady

  const readinessCount = [
    renter.depositReady,
    renter.idReady,
    renter.payslipReady,
    renter.bankStatementsReady,
    renter.referencesReady,
    renter.guarantorAvailable
  ].filter(Boolean).length

  const readinessProfile =
    readinessCount >= 5
      ? "fully-prepared"
      : readinessCount >= 3
      ? "mostly-prepared"
      : readinessCount >= 2
      ? "moderately-prepared"
      : "incomplete"

  const stabilityConfidence =
    normalizeText(
      renter.duration
    ).includes("2+")
      ? "high"
      : normalizeText(
          renter.duration
        ).includes("1-2")
      ? "moderate"
      : "developing"

  const occupancyFit =
    occupancyStatus === "comfortable"
      ? "natural"
      : occupancyStatus === "acceptable"
      ? "moderate"
      : occupancyStatus === "dense"
      ? "tight"
      : "restricted"

  const pressure =
    evaluatePressure(
      renter,
      propertyClass,
      applicantPool,
      affordabilityRatio,
      occupancyFit,
      property.bedrooms
    )

  let approvalChance = 50

  approvalChance += {
    strong: 22,
    stable: 14,
    stretched: 3,
    pressured: -24,
  }[financialStrength]

  approvalChance += {
    elite: 12,
    strong: 8,
    healthy: 5,
    tight: -5,
    negative: -15,
  }[bufferLevel]

  approvalChance += {
    high: 8,
    moderate: 4,
    developing: 0,
    unstable: -12,
  }[stabilityConfidence]

  approvalChance += {
    "fully-prepared": 14,
    "mostly-prepared": 8,
    "moderately-prepared": 3,
    incomplete: -10,
  }[readinessProfile]

  approvalChance -=
    pressure.pressureScore * 1.5

  approvalChance =
    Math.max(
      5,
      Math.min(
        96,
        Math.round(
          approvalChance
        )
      )
    )

  const probableOutcome =
    getProbableOutcome({

      approvalChance,

      propertyClass,

      financialStrength,

      readinessProfile,

      processingComplexity:
        pressure.pressureScore >= 12
          ? "high-friction"
          : pressure.pressureScore >= 7
          ? "explanation-required"
          : pressure.pressureScore >= 4
          ? "moderate-review"
          : "straightforward",

      marketPressure:
        demand === "high"
          ? "high"
          : demand === "normal"
          ? "active"
          : "low",

      competitionLevel:
        approvalChance >= 78
          ? "leading"
          : approvalChance >= 55
          ? "competitive"
          : approvalChance >= 40
          ? "behind-market"
          : "outmatched",

    })

  const feeRisk =
    getFeeRisk({

      approvalChance,

      propertyClass,

      probableOutcome,

      financialStrength,

      processingComplexity:
        pressure.pressureScore >= 12
          ? "high-friction"
          : pressure.pressureScore >= 7
          ? "explanation-required"
          : pressure.pressureScore >= 4
          ? "moderate-review"
          : "straightforward",

      marketPressure:
        demand === "high"
          ? "high"
          : demand === "normal"
          ? "active"
          : "low",

      petsMismatch:false,

      evictionHistory:
        renter.evictionHistory

    })

  const rentRange =
    getRecommendedRentRange({

      totalIncome,

      propertyClass,

      financialStrength,

      stabilityConfidence,

      readinessProfile,

      marketPressure:
        demand === "high"
          ? "high"
          : demand === "normal"
          ? "active"
          : "low"

    })

  return {

    propertyClass,

    feeRisk,

    probableOutcome,

    recommendedRentRange:
      rentRange,

    /*
      FIXED SECTION
    */

    idealPropertyClass:

      propertyClass === "premium"
        ? "upper-mid"
        : propertyClass,

    approvalChance,

    affordabilityRatio,

    pressure:
      pressure.pressureReasons[0] ||
      "No major friction detected.",

    realityCheck:
      approvalChance >= 70
        ? "This property is realistically within reach."
        : "This may require stronger positioning.",

    mainRisk:
      pressure.pressureReasons[0] ||
      "",

    strongestAdvantage:
      pressure.advantages[0] ||
      "Your profile still shows workable approval signals.",

    message:

`Hi,

I'm interested in ${propertyName} and would like to move forward if it's still available.

Combined household income: R${totalIncome.toLocaleString()}

Please let me know the next step.`,

    demand,

    advantage:
      financialStrength === "strong"
        ? "financial"
        : "none",

    frictionPoints:
      pressure.pressureReasons,

    actionPlan:
      pressure.advantages,

    insights:[],

    feeWarnings:[],

    isBestTarget:false,

    reasonToChoose:""

  } as PropertyEvaluation

}
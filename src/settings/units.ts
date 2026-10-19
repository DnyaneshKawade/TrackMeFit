// The person's unit for gym weights (spec T-101), for every training screen.

import { createContext, useContext } from 'react'
import type { WeightUnit } from '../engine/units'

export const UnitContext = createContext<WeightUnit>('kg')

export const useWeightUnit = () => useContext(UnitContext)

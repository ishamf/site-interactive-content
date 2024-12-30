

import { subtractIPRangesAsRecord, validateIPRanges } from './output/IPRangeCalculator'

export function subtractIPRanges(allowedIps, disallowedIPs) {
    return subtractIPRangesAsRecord(allowedIps)(disallowedIPs)
}

export { validateIPRanges }
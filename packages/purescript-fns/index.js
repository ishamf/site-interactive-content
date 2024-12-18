

import { subtractIPRangesAsRecord, validateIPRanges } from './output/Calculator'

export function subtractIPRanges(allowedIps, disallowedIPs) {
    return subtractIPRangesAsRecord(allowedIps)(disallowedIPs)
}

export { validateIPRanges }
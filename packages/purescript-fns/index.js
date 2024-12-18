

import { calcAsRecord, validateIPRanges } from './output/Calculator'

export function calculateIPRanges(allowedIps, disallowedIPs) {
    return calcAsRecord(allowedIps)(disallowedIPs)
}

export { validateIPRanges }
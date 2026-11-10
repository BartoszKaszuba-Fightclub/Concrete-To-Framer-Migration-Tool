/**
 * Pure digest job planner. Component records come first, then section candidates.
 */

export type DigestJob = { id: string; type: string; rootIds: string[] }

export function planDigestJobs(
  structure: { sectionCandidates?: { id: string; rootIds: string[] }[] },
  components: { records?: { id: string; kind: string; nodeId: string }[] },
): DigestJob[] {
  const jobs: DigestJob[] = []
  for (const record of components.records ?? []) {
    if (!record.id || !record.nodeId) continue
    jobs.push({ id: record.id, type: record.kind, rootIds: [record.nodeId] })
  }
  for (const candidate of structure.sectionCandidates ?? []) {
    if (!candidate.rootIds?.length) continue
    jobs.push({ id: candidate.id, type: "section", rootIds: [...candidate.rootIds] })
  }
  return jobs
}

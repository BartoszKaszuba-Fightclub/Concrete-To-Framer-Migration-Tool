---
name: pipeline-test-run
description: Times one migration-pipeline run. The observer dispatches every subagent the runner requests and records wall time and reported activities.
disable-model-invocation: true
---

# Pipeline test run

You are the observer. You dispatch subagents and you record them. The runner follows `.cursor/SKILLS/ORCHESTRATION.md`. Capture, section prompts, and Framer edits happen only inside the agents the runner requests.

No arguments. Read `docs/pipeline-runs/context.md` for the website (URL or fixture), Framer project, branch, and width. A stop note in that file is about an earlier assignment. This invocation starts a new run.

The branch is the Framer branch. The pipeline runs on a clean Framer branch, as `.cursor/SKILLS/BUILDER.md` defines it. Pass that requirement through in the runner prompt.

Missing website, project, or branch: stop and name the missing field. Width defaults to 1200 when the file names none.

## Start the runner

Record the clock with `date +%Y-%m-%dT%H:%M:%S%z`, then dispatch one `generalPurpose` subagent. Its prompt is the block below with the four values filled in. That prompt is the only guidance it gets.

```
You are the runner for the Concrete to Framer migration pipeline.
Repo: <absolute repo path>
Follow .cursor/SKILLS/ORCHESTRATION.md from Spawn through Report.
Ask-first is already answered:
- Website: <website>
- Framer project: <project>
- Branch: <branch>
- Width: <width>
Stay on that orchestration until Report is done.
You spawn only by returning a request. The parent dispatches it and sends back the result. Put the same rule in every prompt you write, so an agent that needs its own subagents returns a request too.
When the orchestration starts agents together, return every request in one message, separated by a line that is only ---.
One request, or one parallel group, then stop and wait.

SPAWN
description: <short name>
skill: <skill path>
resume: new
prompt:
<the full prompt that agent needs, including its skill path and its inputs>

A later phase of an agent that already ran uses its agent id:

SPAWN
description: <short name>
skill: <skill path>
resume: <agent id>
prompt:
<only the new inputs>

When Report is done, return:

DONE
<the report ORCHESTRATION.md asks for, and nothing else>
```

## Dispatch loop

On a `SPAWN` block, or several separated by `---`:

1. Record the clock.
2. Dispatch each request as its own `generalPurpose` subagent. Copy `description` and `prompt` through unchanged. `resume: new` starts a fresh agent. Any other resume value resumes that agent.
3. A parallel group goes out in one message. Wait until every agent in the group has returned.
4. Record the clock again.
5. Resume the runner with each agent's id and its final message, unchanged. Add no instructions.

A return that is neither `SPAWN` nor `DONE`: resume the runner once with `Return a SPAWN block or a DONE block.` A second return of that kind ends the run. The table's last row is that return.

Leave a running agent alone. Publish nothing. Run no extract, digest, or Framer tool yourself. Edit no pipeline file.

## Clock

Wall time is the `date` output immediately before a dispatch and the `date` output immediately after that dispatch returns. A parallel group shares one start and one end. Write the duration as `Xm Ys`. Keep both timestamps in the row.

## Activities

Take activities from that agent's final message, in the order it gave them: commands, files written, and Framer writes. Quote the paths and commands it named. An agent that names none gets `no activities reported`.

## Output

One table. One row per dispatch, in dispatch order. Then the runner's wall time, from the clock before the runner started to the clock after `DONE` or the second bad return. The row below shows the shape. Replace it with this run's dispatches.

| Step | Skill | Started | Ended | Duration | Activities |
| --- | --- | --- | --- | --- | --- |
| 1. Collect the page | `.cursor/SKILLS/COLLECTOR.md` | 2026-11-10T12:00:01+0100 | 2026-11-10T12:04:13+0100 | 4m 12s | `npm run extract:generic …`; wrote `Database/digest/nesting/<slug>/1200/default/` |

Parallel rows share their clock and say so in Duration (`4m 12s, parallel with step 3`). A resume is its own row; Skill stays the same and Step names the phase the runner asked for.

The run is finished when that table is in the reply.

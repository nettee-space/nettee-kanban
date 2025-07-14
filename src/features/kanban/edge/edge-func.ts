// // Setup type definitions for built-in Supabase Runtime APIs
// import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
// import { createClient } from 'jsr:@supabase/supabase-js@2';
// import { Octokit } from 'npm:octokit';
// // create clients and sdk
// const supabase = createClient(
//   Deno.env.get('PROJECT_URL'),
//   Deno.env.get('SERVICE_KEY')
// );
// const octokit = new Octokit({
//   auth: Deno.env.get('GITHUB_TOKEN'),
// });
// // run the sync logic
// Deno.serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     return new Response(null, {
//       status: 204,
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Methods': 'POST, OPTIONS',
//         'Access-Control-Allow-Headers': 'Content-Type, x-github-event',
//       },
//     });
//   }
//   if (req.method !== 'POST') {
//     return new Response('Method Not Allowed', {
//       status: 405,
//     });
//   }
//   // coreParams for operationContext
//   const payload = await req.json().catch(() => null);
//   if (!payload) {
//     return new Response('Invalid JSON body', {
//       status: 400,
//     });
//   }
//   const repoName = payload.repository?.name || payload.repo;
//   if (!repoName) {
//     return new Response('Missing repository name', {
//       status: 400,
//     });
//   }
//   const event = req.headers.get('x-github-event');
//   const action = payload.action;
//   // when user create new repo with github, then create table as same name
//   if (event === 'repository') {
//     if (action !== 'created') {
//       return new Response(`Ignored action: ${action}`, {
//         status: 200,
//       });
//     }
//     const { error } = await supabase.rpc('create_repo_table', {
//       repo_name: repoName,
//     });
//     if (error) {
//       console.error('Error! creating table:', error);
//       return new Response('Table creation failed', {
//         status: 500,
//       });
//     }
//     return new Response(`Table '${repoName}' created`, {
//       status: 200,
//     });
//   }
//   // when user edit kanban, then sync with github issue
//   if (event === 'issues') {
//     const isFromClient = payload?.source === 'client';
//     if (isFromClient) {
//       const { data: latest } = await supabase
//         .from(repoName)
//         .select('number')
//         .order('number', {
//           ascending: false,
//         })
//         .limit(1)
//         .single();
//       const nextNumber = latest?.number != null ? latest.number + 1 : 1;
//       const rawNumber = payload.issue_number;
//       const issueNumber =
//         typeof rawNumber === 'number' && !isNaN(rawNumber)
//           ? rawNumber
//           : parseInt(rawNumber || '') || nextNumber;
//       const { error: upsertError } = await supabase.from(repoName).upsert(
//         [
//           {
//             ...payload.issue,
//             number: issueNumber,
//           },
//         ],
//         {
//           onConflict: 'number',
//         }
//       );
//       if (upsertError) {
//         console.error('Error! inserting to DB:', upsertError);
//         return new Response('Initial DB insert failed', {
//           status: 500,
//         });
//       }
//       if (action === 'create') {
//         const createIssue = await octokit.rest.issues.create({
//           owner: payload.owner,
//           repo: payload.repo,
//           title: payload.issue.title,
//           body: payload.issue.body,
//           assignees: payload.issue.assignees,
//           labels: payload.issue.labels,
//         });
//         return new Response(JSON.stringify(createIssue), {
//           status: 200,
//           headers: {
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Origin': '*',
//           },
//         });
//       }
//       if (action === 'update') {
//         const updateIssue = await octokit.rest.issues.update({
//           owner: payload.owner,
//           repo: payload.repo,
//           issue_number: payload.issue_number,
//           title: payload.issue.title,
//           body: payload.issue.body,
//           assignees: payload.issue.assignees,
//           labels: payload.issue.labels,
//         });
//         return new Response(JSON.stringify(updateIssue), {
//           status: 200,
//           headers: {
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Origin': '*',
//           },
//         });
//       }
//       return new Response('Invalid action', {
//         status: 400,
//       });
//     } else {
//       const issue = payload.issue;
//       if (!issue) {
//         return new Response('Missing issue data', {
//           status: 400,
//         });
//       }
//       const { data: existing } = await supabase
//         .from(repoName)
//         .select('progress, sta_dt, end_dt, parent')
//         .eq('number', issue.number)
//         .single();
//       const { error: webhookError } = await supabase.from(repoName).upsert(
//         [
//           {
//             id: issue.id,
//             number: issue.number,
//             html_url: issue.html_url,
//             title: issue.title,
//             body: issue.body,
//             state: issue.state,
//             created_at: issue.created_at,
//             updated_at: issue.updated_at,
//             assignees: issue.assignees.map((a) => a.login),
//             labels: issue.labels.map((l) => l.name),
//             progress: existing?.progress ?? 'TODO',
//             sta_dt: existing?.sta_dt ?? null,
//             end_dt: existing?.end_dt ?? null,
//             parent: existing?.parent ?? null,
//           },
//         ],
//         {
//           onConflict: 'number',
//         }
//       );
//       if (webhookError) {
//         console.error('Error! inserting to DB:', webhookError);
//         return new Response('Webhook upsert failed', {
//           status: 500,
//         });
//       }
//       return new Response('Webhook handled', {
//         status: 200,
//       });
//     }
//   }
//   return new Response('Unsupported event type', {
//     status: 400,
//   });
// });

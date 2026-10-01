import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const root = new URL('../../', import.meta.url);
const ghExecutable = '/usr/bin/gh';
const manifest = JSON.parse(readFileSync(new URL('docs/backlog/manifest.json', root), 'utf8'));
const functionalSpec = readFileSync(new URL('docs/spec.md', root), 'utf8');
const markerPattern = /<!-- maia-us-id: ([A-Z0-9-]+) -->/;

function run(commandArgs, { input, allowFailure = false } = {}) {
  const result = spawnSync(ghExecutable, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    input,
    maxBuffer: 20 * 1024 * 1024
  });

  if (result.status !== 0 && !allowFailure) {
    throw new Error(
      result.stderr.trim() || result.stdout.trim() || `gh ${commandArgs.join(' ')} failed`
    );
  }

  return result.stdout.trim();
}

function runJson(commandArgs, options) {
  const output = run(commandArgs, options);
  return output ? JSON.parse(output) : {};
}

function graphql(query, variables = {}) {
  const result = runJson(['api', 'graphql', '--input', '-'], {
    input: JSON.stringify({ query, variables })
  });
  if (result.errors?.length)
    throw new Error(result.errors.map((error) => error.message).join('; '));
  return result;
}

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseSections(source) {
  const lines = source.split(/\r?\n/);
  const sections = new Map();
  const occurrences = new Map();
  let current = null;

  for (const line of lines) {
    const separatorIndex = line.indexOf(':');
    const heading = separatorIndex >= 0 ? line.slice(0, separatorIndex).trim() : '';
    const storyHeading = /^\d+\.\d+$/.test(heading);
    const epicHeading = /^\d+$/.test(heading);

    if (storyHeading) {
      const count = (occurrences.get(heading) || 0) + 1;
      occurrences.set(heading, count);
      current = {
        id: heading,
        occurrence: count,
        title: line.slice(separatorIndex + 1).trim(),
        lines: []
      };
      sections.set(`${heading}#${count}`, current);
      continue;
    }

    if (epicHeading) {
      current = null;
      continue;
    }

    if (current) current.lines.push(line.trim());
  }

  return sections;
}

const sections = parseSections(functionalSpec);

function sectionFor(story, reference = story.source, occurrence = story.sourceOccurrence || 1) {
  const section = sections.get(`${reference}#${occurrence}`);
  if (!section)
    throw new Error(`Missing docs/spec.md section ${reference}#${occurrence} for ${story.id}`);
  return section;
}

function storyParts(section) {
  const lines = section.lines.filter(Boolean);
  const personaIndex = lines.findIndex((line) => /^En tant que\b/i.test(line));
  const wantIndex = lines.findIndex((line) => /^Je veux\b/i.test(line));
  const benefitIndex = lines.findIndex((line) => /^Afin (?:de\b|d['’])/i.test(line));
  const criteriaIndex = lines.findIndex((line) => /^Critères d[’']acceptation/i.test(line));

  if ([personaIndex, wantIndex, benefitIndex, criteriaIndex].some((index) => index < 0)) {
    throw new Error(
      `Incomplete User Story in docs/spec.md section ${section.id}#${section.occurrence}`
    );
  }

  return {
    description: lines.slice(0, personaIndex).join(' '),
    persona: lines[personaIndex],
    want: lines[wantIndex],
    benefit: lines[benefitIndex],
    criteria: lines.slice(criteriaIndex + 1)
  };
}

function storyBody(story) {
  const primary = storyParts(sectionFor(story));
  const mergedCriteria = (story.mergedSources || []).flatMap((source) => {
    const [reference, rawOccurrence = '1'] = source.split('#');
    return storyParts(sectionFor(story, reference, Number(rawOccurrence))).criteria;
  });
  const criteria = [...new Set([...primary.criteria, ...mergedCriteria])];
  const checked = story.status === 'Done' ? 'x' : ' ';
  const technical = story.technicalRef
    ? `\n## Tâches techniques\n\n- [ ] Respecter le contrat de \`docs/spec_tech.md\` section ${story.technicalRef}.\n- [ ] Couvrir les parcours frontend et backend concernés.\n- [ ] Ajouter ou adapter les tests nécessaires.\n`
    : '';

  return `<!-- maia-us-id: ${story.id} -->

${primary.description}

## User Story

${primary.persona},
${primary.want.replace(/^Je/, 'je')},
${primary.benefit.replace(/^Afin/, 'afin')}.

## Critères d'acceptation

${criteria.map((criterion) => `- [${checked}] ${criterion}`).join('\n')}
${technical}
## Pilotage

- EPIC : \`${story.epic}\`
- Priorité : \`${story.priority}\`
- Estimation : \`${story.estimate}\` points
- Source : \`docs/spec.md\` section ${story.source}
`;
}

function technicalBody(item) {
  const checked = item.status === 'Done' ? 'x' : ' ';
  return `<!-- maia-us-id: ${item.id} -->

## Objectif technique

${item.summary}

## Critères de réalisation

- [${checked}] Le changement est versionné et documenté.
- [${checked}] Les contrôles adaptés au chantier sont passés.
- [${checked}] Le résultat est intégré au dépôt.

## Pilotage

- Domaine : \`${item.area}\`
- Source : \`docs/log.md\`
`;
}

function labelsFor(item, type) {
  const labels = [`type:${type}`];
  if (item.epic) {
    const epic = manifest.epics.find((candidate) => candidate.id === item.epic);
    labels.push(`epic:${epic.key}`);
  }
  for (const area of item.areas || (item.area ? [item.area] : [])) labels.push(`area:${area}`);
  return labels;
}

const labelDefinitions = [
  ['type:user-story', '1d76db', 'User Story produit'],
  ['type:epic', '5319e7', 'EPIC regroupant plusieurs User Stories'],
  ['type:technical', '6f42c1', 'Chantier technique'],
  ...manifest.epics.map((epic) => [
    `epic:${epic.key}`,
    '0e8a16',
    epic.title.replace(/^EPIC - /, '')
  ]),
  ['area:frontend', 'fbca04', 'Application mobile et expérience utilisateur'],
  ['area:backend', '0052cc', 'API, données et règles métier'],
  ['area:infra', '006b75', 'Docker, Nginx et environnements'],
  ['area:ci', '0366d6', 'Intégration et livraison continues'],
  ['area:security', 'b60205', 'Sécurité et confidentialité'],
  ['area:platform', 'c5def5', 'Socle transversal du produit']
];

function issueBodyForEpic(epic, children = []) {
  return `<!-- maia-us-id: ${epic.id} -->

## Objectif

Regrouper et suivre les User Stories de **${epic.title.replace(/^EPIC - /, '')}**.

## User Stories

${children.length ? children.map(({ issue, done }) => `- [${done ? 'x' : ' '}] #${issue.number}`).join('\n') : '- Les User Stories seront liées pendant la synchronisation.'}

## Source

- ${epic.source}
`;
}

function buildSchedule() {
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  const open = manifest.stories
    .filter((story) => story.status !== 'Done')
    .map((story, index) => ({ story, index }))
    .sort(
      (left, right) =>
        priorityOrder[left.story.priority] - priorityOrder[right.story.priority] ||
        left.index - right.index
    );
  const assignments = new Map();
  let sprint = 1;
  let load = 0;

  for (const { story } of open) {
    if (load > 0 && load + story.estimate > manifest.project.sprintCapacity) {
      sprint += 1;
      load = 0;
    }
    assignments.set(story.id, sprint);
    load += story.estimate;
  }

  const sprintCount = Math.max(3, sprint);
  const iterations = Array.from({ length: sprintCount }, (_, index) => {
    const start = new Date(`${manifest.project.startDate}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() + index * manifest.project.sprintDurationDays);
    return {
      title: `Sprint ${index + 1}`,
      startDate: start.toISOString().slice(0, 10),
      duration: manifest.project.sprintDurationDays
    };
  });

  return { assignments, iterations };
}

function localPlan() {
  for (const story of manifest.stories) storyBody(story);
  const { assignments, iterations } = buildSchedule();
  const counts = manifest.stories.reduce((result, story) => {
    result[story.status] = (result[story.status] || 0) + 1;
    return result;
  }, {});
  console.log(`${apply ? 'APPLY' : 'DRY-RUN'} ${manifest.repository}`);
  console.log(`Project: ${manifest.project.title}`);
  console.log(
    `EPIC: ${manifest.epics.length}, US: ${manifest.stories.length}, TECH: ${manifest.technical.length}`
  );
  console.log(
    `Statuses: ${Object.entries(counts)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')}`
  );
  console.log(
    `Planning: ${iterations.length} sprints, ${manifest.project.sprintCapacity} points/sprint`
  );
  for (const iteration of iterations) {
    const ids = [...assignments.entries()]
      .filter(([, value]) => value === Number(iteration.title.split(' ')[1]))
      .map(([id]) => id);
    console.log(`- ${iteration.title} (${iteration.startDate}): ${ids.join(', ')}`);
  }
}

function listIssues() {
  return runJson([
    'issue',
    'list',
    '--repo',
    manifest.repository,
    '--state',
    'all',
    '--limit',
    '1000',
    '--json',
    'number,title,body,state,url,labels'
  ]);
}

function issueMaps(issues) {
  const byId = new Map();
  const byTitle = new Map();
  for (const issue of issues) {
    const match = issue.body?.match(markerPattern);
    if (match) byId.set(match[1], issue);
    byTitle.set(normalize(issue.title), issue);
  }
  return { byId, byTitle };
}

function ensureLabels() {
  for (const [name, color, description] of labelDefinitions) {
    run([
      'label',
      'create',
      name,
      '--repo',
      manifest.repository,
      '--color',
      color,
      '--description',
      description,
      '--force'
    ]);
  }
}

function ensureIssue(item, type, body, maps) {
  let issue = maps.byId.get(item.id) || maps.byTitle.get(normalize(item.title));
  const labels = labelsFor(item, type);

  if (!issue) {
    const url = run([
      'issue',
      'create',
      '--repo',
      manifest.repository,
      '--title',
      item.title,
      '--body',
      body,
      ...labels.flatMap((label) => ['--label', label])
    ]);
    const number = Number(url.match(/\/(\d+)$/)?.[1]);
    issue = {
      number,
      title: item.title,
      body,
      state: 'OPEN',
      url,
      labels: labels.map((name) => ({ name }))
    };
    maps.byId.set(item.id, issue);
    maps.byTitle.set(normalize(item.title), issue);
    console.log(`created #${number} ${item.id}`);
  } else {
    const currentLabels = new Set(issue.labels.map((label) => label.name));
    const missingLabels = labels.filter((label) => !currentLabels.has(label));
    if (missingLabels.length) {
      run([
        'issue',
        'edit',
        String(issue.number),
        '--repo',
        manifest.repository,
        '--add-label',
        missingLabels.join(',')
      ]);
    }
    if (!issue.body?.match(markerPattern)) {
      const markedBody = `${issue.body || ''}\n\n<!-- maia-us-id: ${item.id} -->`.trim();
      run([
        'issue',
        'edit',
        String(issue.number),
        '--repo',
        manifest.repository,
        '--body',
        markedBody
      ]);
      issue.body = markedBody;
    }
    console.log(`matched #${issue.number} ${item.id}`);
  }

  const shouldClose = item.status === 'Done';
  if (shouldClose && issue.state !== 'CLOSED') {
    if (type === 'technical') {
      run(['issue', 'edit', String(issue.number), '--repo', manifest.repository, '--body', body]);
    }
    run([
      'issue',
      'close',
      String(issue.number),
      '--repo',
      manifest.repository,
      '--reason',
      'completed'
    ]);
    issue.state = 'CLOSED';
  } else if (!shouldClose && issue.state === 'CLOSED') {
    run(['issue', 'reopen', String(issue.number), '--repo', manifest.repository]);
    issue.state = 'OPEN';
  }

  return issue;
}

function ensureProject() {
  const projects = runJson([
    'project',
    'list',
    '--owner',
    manifest.project.owner,
    '--limit',
    '100',
    '--format',
    'json'
  ]);
  let project = projects.projects.find((candidate) => candidate.title === manifest.project.title);
  if (!project) {
    project = runJson([
      'project',
      'create',
      '--owner',
      manifest.project.owner,
      '--title',
      manifest.project.title,
      '--format',
      'json'
    ]);
    console.log(`created project ${project.url}`);
  }
  run([
    'project',
    'edit',
    String(project.number),
    '--owner',
    manifest.project.owner,
    '--visibility',
    'PUBLIC',
    '--description',
    'Backlog, sprints et roadmap du produit Maïa. GitHub Issues est la source de vérité.'
  ]);
  const linkResult = run(
    [
      'project',
      'link',
      String(project.number),
      '--owner',
      manifest.project.owner,
      '--repo',
      manifest.repository
    ],
    { allowFailure: true }
  );
  if (!linkResult) {
    console.warn(
      'Project repository link skipped: the fine-grained token does not grant this optional permission.'
    );
  }
  return project;
}

function projectFields(projectNumber) {
  return runJson([
    'project',
    'field-list',
    String(projectNumber),
    '--owner',
    manifest.project.owner,
    '--limit',
    '100',
    '--format',
    'json'
  ]).fields;
}

function ensureProjectFields(project) {
  let fields = projectFields(project.number);
  const status = fields.find((field) => field.name === 'Status');
  const statusOptions = [
    { name: 'Backlog', color: 'GRAY', description: 'À prioriser' },
    { name: 'Todo', color: 'BLUE', description: 'Planifié et prêt' },
    { name: 'In Progress', color: 'YELLOW', description: 'Développement en cours' },
    { name: 'Review', color: 'PURPLE', description: 'En revue' },
    { name: 'Done', color: 'GREEN', description: 'Terminé' }
  ];
  if (
    status.options.map((option) => option.name).join('|') !==
    statusOptions.map((option) => option.name).join('|')
  ) {
    graphql(
      'mutation($input: UpdateProjectV2FieldInput!) { updateProjectV2Field(input: $input) { projectV2Field { ... on ProjectV2SingleSelectField { id name } } } }',
      {
        input: {
          fieldId: status.id,
          singleSelectOptions: statusOptions
        }
      }
    );
  }

  const createField = (name, dataType, options = []) => {
    if (fields.some((field) => field.name === name)) return;
    const command = [
      'project',
      'field-create',
      String(project.number),
      '--owner',
      manifest.project.owner,
      '--name',
      name,
      '--data-type',
      dataType,
      '--format',
      'json'
    ];
    if (options.length) command.push('--single-select-options', options.join(','));
    run(command);
  };

  createField('Priority', 'SINGLE_SELECT', ['P0', 'P1', 'P2', 'P3']);
  createField('Estimate', 'NUMBER');
  createField('Start date', 'DATE');
  createField('Target date', 'DATE');
  createField('Story ID', 'TEXT');
  createField('Epic', 'SINGLE_SELECT', [...manifest.epics.map((epic) => epic.id), 'TECH-PLATFORM']);

  fields = projectFields(project.number);
  if (!fields.some((field) => field.name === 'Sprint')) {
    const { iterations } = buildSchedule();
    graphql(
      'mutation($input: CreateProjectV2FieldInput!) { createProjectV2Field(input: $input) { projectV2Field { ... on ProjectV2IterationField { id name } } } }',
      {
        input: {
          projectId: project.id,
          dataType: 'ITERATION',
          name: 'Sprint',
          iterationConfiguration: {
            startDate: manifest.project.startDate,
            duration: manifest.project.sprintDurationDays,
            iterations
          }
        }
      }
    );
  }

  fields = projectFields(project.number);
  for (const field of fields.filter((entry) => entry.type === 'ProjectV2IterationField')) {
    const result = graphql(
      'query($id: ID!) { node(id: $id) { ... on ProjectV2IterationField { configuration { iterations { id title } completedIterations { id title } } } } }',
      { id: field.id }
    );
    field.options = [
      ...result.data.node.configuration.iterations,
      ...result.data.node.configuration.completedIterations
    ];
  }
  return fields;
}

function ensureViews(project, fields) {
  const result = graphql(
    'query($owner: String!, $number: Int!) { organization(login: $owner) { projectV2(number: $number) { views(first: 50) { nodes { name layout } } } } }',
    { owner: manifest.project.owner, number: project.number }
  );
  const existing = new Set(result.data.organization.projectV2.views.nodes.map((view) => view.name));
  const visibleFieldIds = fields
    .filter((field) =>
      ['Status', 'Priority', 'Estimate', 'Sprint', 'Start date', 'Target date', 'Epic'].includes(
        field.name
      )
    )
    .map((field) => field.id);
  const createView = (name, layout) => {
    if (existing.has(name)) return;
    const input = { projectId: project.id, name, layout };
    if (layout !== 'ROADMAP_LAYOUT') input.configuration = { visibleFieldIds };
    graphql(
      'mutation($input: CreateProjectV2ViewInput!) { createProjectV2View(input: $input) { projectV2View { id name layout } } }',
      { input }
    );
  };
  createView('Kanban', 'BOARD_LAYOUT');
  createView('Roadmap', 'ROADMAP_LAYOUT');
}

function projectItems(projectNumber) {
  return runJson([
    'project',
    'item-list',
    String(projectNumber),
    '--owner',
    manifest.project.owner,
    '--limit',
    '1000',
    '--format',
    'json'
  ]).items;
}

function optionId(field, name) {
  const option = field.options?.find(
    (candidate) => candidate.name === name || candidate.title === name
  );
  if (!option) throw new Error(`Missing option ${name} in project field ${field.name}`);
  return option.id;
}

function setField(project, itemId, field, kind, value) {
  if (value === undefined || value === null) return;
  const command = [
    'project',
    'item-edit',
    '--id',
    itemId,
    '--project-id',
    project.id,
    '--field-id',
    field.id
  ];
  if (kind === 'single') command.push('--single-select-option-id', optionId(field, value));
  if (kind === 'iteration') command.push('--iteration-id', optionId(field, value));
  if (kind === 'number') command.push('--number', String(value));
  if (kind === 'date') command.push('--date', value);
  if (kind === 'text') command.push('--text', value);
  run(command);
}

function currentFieldValue(item, name) {
  const key = `${name[0].toLowerCase()}${name.slice(1)}`;
  const value = item[key];
  return value && typeof value === 'object' && 'title' in value ? value.title : value;
}

function addAndConfigureItems(project, fields, records) {
  const field = Object.fromEntries(fields.map((entry) => [entry.name, entry]));
  const existingItems = new Map(
    projectItems(project.number)
      .filter((item) => item.content?.url || item.url)
      .map((item) => [item.content?.url || item.url, item])
  );
  const { assignments, iterations } = buildSchedule();

  for (const record of records) {
    let item = existingItems.get(record.issue.url);
    if (!item) {
      item = runJson([
        'project',
        'item-add',
        String(project.number),
        '--owner',
        manifest.project.owner,
        '--url',
        record.issue.url,
        '--format',
        'json'
      ]);
      existingItems.set(record.issue.url, item);
    }
    const itemId = item.id;
    const source = record.source;
    const sprintNumber = assignments.get(source.id);
    const iteration = sprintNumber ? iterations[sprintNumber - 1] : null;
    const startDate = source.completedOn || iteration?.startDate;
    const targetDate =
      source.completedOn ||
      (iteration
        ? (() => {
            const date = new Date(`${iteration.startDate}T00:00:00Z`);
            date.setUTCDate(date.getUTCDate() + iteration.duration - 1);
            return date.toISOString().slice(0, 10);
          })()
        : null);
    const epicValue = source.epic || (source.id.startsWith('EPIC-') ? source.id : 'TECH-PLATFORM');

    const update = (name, kind, value) => {
      if (value !== undefined && value !== null && currentFieldValue(item, name) !== value) {
        setField(project, itemId, field[name], kind, value);
      }
    };
    update('Status', 'single', source.status || 'Backlog');
    update('Story ID', 'text', source.id);
    update('Epic', 'single', epicValue);
    update('Priority', 'single', source.priority);
    update('Estimate', 'number', source.estimate);
    update('Sprint', 'iteration', iteration?.title);
    update('Start date', 'date', startDate);
    update('Target date', 'date', targetDate);
  }
}

localPlan();

const currentIssues = listIssues();
const duplicateMaps = issueMaps(currentIssues);
const desiredIds = [...manifest.epics, ...manifest.stories, ...manifest.technical].map(
  (item) => item.id
);
const existingIds = desiredIds.filter((id) => duplicateMaps.byId.has(id));
console.log(
  `GitHub duplicate check: ${existingIds.length} existing ID(s), ${desiredIds.length - existingIds.length} missing ID(s)`
);

if (!apply) {
  console.log(
    'No GitHub data changed. Re-run with --apply after reviewing docs/backlog/proposition.md.'
  );
  process.exit(0);
}

ensureLabels();
const project = ensureProject();
const fields = ensureProjectFields(project);
ensureViews(project, fields);

const records = [];
const epicRecords = new Map();
for (const epic of manifest.epics) {
  const issue = ensureIssue(epic, 'epic', issueBodyForEpic(epic), duplicateMaps);
  const record = { source: { ...epic, status: 'Backlog' }, issue };
  records.push(record);
  epicRecords.set(epic.id, record);
}
for (const story of manifest.stories) {
  const issue = ensureIssue(story, 'user-story', storyBody(story), duplicateMaps);
  records.push({ source: story, issue });
}
for (const item of manifest.technical) {
  const issue = ensureIssue(item, 'technical', technicalBody(item), duplicateMaps);
  records.push({ source: item, issue });
}

for (const epic of manifest.epics) {
  const children = records
    .filter((record) => record.source.epic === epic.id)
    .map((record) => ({ issue: record.issue, done: record.source.status === 'Done' }));
  const epicIssue = epicRecords.get(epic.id).issue;
  run([
    'issue',
    'edit',
    String(epicIssue.number),
    '--repo',
    manifest.repository,
    '--body',
    issueBodyForEpic(epic, children)
  ]);
}

addAndConfigureItems(project, fields, records);
console.log(`Synchronized ${records.length} Issues into ${project.url}`);

export const profile = {
  name: 'Armaan Hirani',
  role: 'Software Engineer',
  location: 'Austin, TX',
  email: 'hiraniarmaan@gmail.com',
  linkedin: 'https://www.linkedin.com/in/armaan-hirani/',
  github: 'https://github.com/armaanh1',
  education: {
    school: 'The University of Texas at Austin',
    degree: 'B.S. Computer Science',
    span: 'Aug 2023 — Dec 2026',
    note: 'Undergraduate TA for CS 349. Creative Media Intern, Texas Athletics.',
  },
};

/* The hero pipeline runs this as its instruction stream. Each instruction
   retires into the register file on the right, so the stream doubles as the
   introduction: op is the mnemonic, `writes` is what lands in the register. */
export type Instruction = {
  op: string;
  operands: string;
  reg: string;
  writes: string;
  note: string;
};

export const stream: Instruction[] = [
  {
    op: 'SLF',
    operands: 'x0, [self]',
    reg: 'x0',
    writes: 'Armaan Hirani',
    note: 'V21.01',
  },
  {
    op: 'ABT',
    operands: 'x1, [about]',
    reg: 'x1',
    writes: 'Engineer / Creative',
    note: 'MAKES COOL STUFF',
  },
  {
    op: 'EDU',
    operands: 'x2, #UT_AUSTIN',
    reg: 'x2',
    writes: 'B.S. Computer Science',
    note: 'UT AUSTIN, CLASS OF 2027',
  },
  {
    op: 'EXP',
    operands: 'x3, google_cloud_ai',
    reg: 'x3',
    writes: 'Google, SWE Intern',
    note: 'CLOUD AI, ML INFRA',
  },
  {
    op: 'EXP',
    operands: 'x4, amazon_last_mile',
    reg: 'x4',
    writes: 'Amazon, SDE Intern',
    note: 'LAST MILE, CORE INFRA',
  },
  {
    op: 'EXP',
    operands: 'x5, citigroup_wlt',
    reg: 'x5',
    writes: 'Citigroup, Tech Analyst',
    note: 'LENDING & RISK, CORE INFRA',
  },
];

export const STAGES = [
  { id: 'IF', label: 'Fetch' },
  { id: 'ID', label: 'Decode' },
  { id: 'EX', label: 'Execute' },
  { id: 'MEM', label: 'Memory' },
  { id: 'WB', label: 'Writeback' },
] as const;

export type Role = {
  company: string;
  team: string;
  title: string;
  span: string;
  place: string;
  bullets: string[];
  tags: string[];
};

export const roles: Role[] = [
  {
    company: 'Google',
    team: 'Cloud AI, Google Cloud Platform',
    title: 'Software Engineer Intern',
    span: 'May 2026 — Aug 2026',
    place: 'Sunnyvale, CA',
    bullets: [
      'Cut LLM resource usage in the document parsing workflow by adding a caching layer to the Gemini Enterprise Agent Platform.',
      'Built an agent that summarizes 20+ managed binaries, deployments, SLOs, and customer bugs for on-call engineers.',
      'Made the ingestion pipeline more reliable by refining ML infrastructure monitoring and alerting for document parsing services.',
    ],
    tags: ['LLM Infrastructure', 'Agentic Workflows', 'Observability', 'GCP'],
  },
  {
    company: 'Amazon',
    team: 'Last Mile Under the Roof Tech, Amazon Delivery',
    title: 'Software Development Engineer Intern',
    span: 'Aug 2025 — Nov 2025',
    place: 'Bellevue, WA',
    bullets: [
      'Built a GenAI tool that turns service change requests into actionable tasks, cutting on-call hours by 15%.',
      'Developed a testing system that mimics user activity end to end and watches availability and latency in real time.',
      'Unified three data ingestion applications into one event-driven architecture, improving reliability across teams.',
    ],
    tags: ['GenAI', 'Event-driven Architecture', 'Reliability', 'AWS'],
  },
  {
    company: 'Citigroup',
    team: 'Wholesale Lending Tech, Services & Markets',
    title: 'Technology Summer Analyst',
    span: 'Jun 2025 — Aug 2025',
    place: 'Irving, TX',
    bullets: [
      'Modernized backend infrastructure with a team of engineers as part of a broader SRE effort.',
      'Moved a monolith of 50+ APIs into a modular FastAPI microservice architecture.',
      'Built NLP pipeline components for a support application, cutting manual review time by over 40%.',
    ],
    tags: ['FastAPI', 'Microservices', 'NLP'],
  },
];

export type Project = {
  name: string;
  span: string;
  blurb: string;
  bullets: string[];
  stack: string[];
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    name: 'Energy Efficient AI Inference Toolkit',
    span: 'Feb 2025 — Apr 2025',
    blurb:
      'A benchmarking harness that asks what a model actually costs to run, not just how accurate it is.',
    bullets: [
      'Integrated Intel RAPL and NVIDIA NVML for accurate CPU and GPU energy measurement during training and inference.',
      'Applied quantization, pruning, and knowledge distillation to a Vision Transformer trained on CIFAR-100.',
      'Built a configurable evaluation pipeline so pruning, quantization, and energy/accuracy benchmarks are reproducible.',
    ],
    stack: ['Python', 'PyTorch', 'RAPL', 'NVML'],
    links: [
      { label: 'GitHub', href: 'https://github.com/armaanh1/energy-efficient-ai-inference' },
      { label: 'Research paper', href: 'https://github.com/armaanh1/energy-efficient-ai-inference/blob/main/EEC_Research_Paper.pdf' },
    ],
  },
  {
    name: 'Hardware System Emulator',
    span: 'Apr 2024 — May 2024',
    blurb:
      'A single-core CPU rebuilt from the ALU up, then wired to a browser so you can watch it think.',
    bullets: [
      'Implemented the ALU of a single-core CPU in C.',
      'Emulated ARM64 instruction processing through a 5-stage PIPE architecture with flag control and hazard handling.',
      'Built a Node.js WebSocket-to-TCP proxy that streams per-cycle pipeline state to a browser UI for debugging.',
    ],
    stack: ['C', 'ARM64', 'Node.js', 'WebSockets'],
    links: [],
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: 'Languages',
    items: ['Python', 'C', 'C++', 'Java', 'TypeScript', 'JavaScript', 'Ruby', 'SQL', 'KQL', 'ARM Assembly'],
  },
  {
    group: 'Frameworks',
    items: ['FastAPI', 'Flask', 'GraphQL', 'PyTorch', 'TensorFlow', 'Airflow', 'CUDA', 'NumPy', 'Pandas', 'Cypress'],
  },
  {
    group: 'Platforms',
    items: ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CDK', 'Linux', 'Git', 'ElasticDB', 'OracleDB', 'Swagger'],
  },
];

export const coursework = [
  'Operating Systems',
  'Algorithms',
  'Computer Architecture & Organization',
  'Energy Efficient Computing',
  'Natural Language Processing',
  'Software Engineering',
  'Object Oriented Programming',
  'Differential Equations with Linear Algebra',
];

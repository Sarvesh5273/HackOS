// src/constants/my-skills.ts

export const MY_PROFILE = {
  // TIER 1: The "SkillNova" Stack (High Confidence)
  // These are the tools you use daily.
  core_stack: [
    'react', 
    'next.js', 
    'typescript', 
    'tailwind', 
    'supabase',
    'python',  // For the AI backend
    'fastapi',
    'openai'
  ],

  // TIER 2: Adjacent / Infrastructure
  adjacent_skills: [
    'node.js', 
    'postgresql', 
    'prisma', 
    'docker', 
    'git',
    'vercel'
  ],

  // TIER 3: Strategic Learning (For Product Features)
  // You mentioned adding "AI Agents" and "Recruiter Portals" - these fit here.
  learning_goals: [
    'ai agents',        // For the automated interview round
    'rag',              // For the context-aware chatbot
    'vector database',  // For storing lecture contexts
    'analytics'         // For the resume dashboard
  ],

  // DOMAIN BONUS: Purely for your Startup Idea
  // If a hackathon matches these, you can reuse your existing SkillNova code.
  preferred_domains: [
    'edtech', 
    'education', 
    'hrtech', 
    'recruitment', 
    'saas'
  ]
};
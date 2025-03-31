export interface AgentTile {
  id: string;
  name: string;
  title: string;
  description: string;
  features: string[];
}

export const agents: AgentTile[] = [
  {
    id: 'astra',
    name: 'Astra',
    title: 'The Astrologer',
    description: 'Astra, the celestial guide, offers personalized astrological insights based on your birth chart. Explore your cosmic blueprint and discover what the stars have in store.',
    features: ['Birth chart analysis', 'Daily horoscopes', 'Compatibility readings', 'Astrological queries']
  },
  {
    id: 'ember',
    name: 'Ember',
    title: 'The Therapist',
    description: 'Ember provides a safe and supportive space for you to explore your thoughts and feelings. Engage in confidential conversations and receive empathetic guidance.',
    features: ['Active listening', 'Mood tracking', 'Coping strategy suggestions', 'Mental well-being resources']
  },
  {
    id: 'gustavo',
    name: 'Gustavo',
    title: 'The Personal Chef',
    description: 'Gustavo, your culinary confidant, creates personalized meal plans and recipes based on your dietary preferences and restrictions. From quick weeknight dinners to gourmet feasts, Gustavo will help you cook with confidence.',
    features: ['Recipe generation', 'Dietary filter', 'Shopping list creation', 'Cooking tips']
  },
  {
    id: 'lingua',
    name: 'Lingua',
    title: 'The Language Tutor',
    description: 'Lingua, the polyglot AI, offers interactive language lessons and practice sessions. Learn new vocabulary, grammar, and pronunciation in a fun and engaging way.',
    features: ['Vocabulary flashcards', 'Grammar exercises', 'Pronunciation practice', 'Conversation simulations']
  },
  {
    id: 'chronos',
    name: 'Chronos',
    title: 'The Historical Scholar',
    description: 'Chronos, the keeper of history, brings the past to life with engaging stories and detailed explanations. Explore historical events, figures, and cultures with this knowledgeable AI.',
    features: ['Timeline exploration', 'Historical biographies', 'Event analysis', 'Historical Q&A']
  },
  {
    id: 'muse',
    name: 'Muse',
    title: 'The Creative Writing Partner',
    description: 'Muse, your literary collaborator, helps you overcome writer\'s block and unleash your creativity. Brainstorm story ideas, develop characters, and refine your writing style with this inspiring AI.',
    features: ['Story prompts', 'Character development', 'Plot suggestions', 'Writing feedback']
  },
  {
    id: 'aegis',
    name: 'Aegis',
    title: 'The Financial Advisor',
    description: 'Aegis will help you manage your personal finances. From budgeting and saving to investing and retirement planning, Aegis provides personalized financial guidance.',
    features: ['Budgeting tools', 'Investment analysis', 'Financial planning', 'Market updates']
  },
  {
    id: 'voyager',
    name: 'Voyager',
    title: 'The Travel Planner',
    description: 'Voyager, your travel concierge, will help you plan unforgettable trips. From finding the best deals on flights and hotels to creating personalized itineraries, Voyager takes the stress out of travel planning.',
    features: ['Flight and hotel search', 'Itinerary planning', 'Local recommendations', 'Travel tips']
  }
] as const; 
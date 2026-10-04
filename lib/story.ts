export const characters = ["quill","ember","willow"] as const;
export type Character = typeof characters[number];
export type Lean = "A"|"B"|"unsure";
export type Perspective={advice:string;lean:Lean;reason:string;keepsake:string};
export type Council={quill:Perspective;ember:Perspective;willow:Perspective;next_step:string};
export type StoryInput={question:string;optionA:string;optionB:string};
export type StoryResult={council:Council;tickets:Partial<Record<Character,string>>;sample?:boolean};
export const profiles={quill:{name:"Quill",role:"The practical perspective",color:"#9aa7f0"},ember:{name:"Ember",role:"The careful perspective",color:"#a7d9a2"},willow:{name:"Willow",role:"The heart's perspective",color:"#f4a9b6"}};
export function leaning(council:Council){const a=characters.filter(k=>council[k].lean==="A").length;const b=characters.filter(k=>council[k].lean==="B").length;return {a,b,winner:a>=2?"A" as Lean:b>=2?"B" as Lean:"unsure" as Lean};}
export const sampleInput={question:"I want to make more room for creativity. Should I join a weekend painting class or start a little project at home?",optionA:"Join the painting class",optionB:"Start a project at home"};
export const sampleCouncil:Council={
quill:{advice:"A class gives your creative time a place in the calendar. If its cost and schedule fit, that structure may help you begin. Before committing, find out whether a single trial session is possible. A small experiment can tell you more than a perfect plan.",lean:"A",reason:"A regular time and a little structure could make starting easier.",keepsake:"Try a small experiment before making a big commitment."},
ember:{advice:"I would begin with a small project at home. You can use what you already have and see how you feel without booking every weekend. Set a modest limit on supplies, though. Preparing to make something can quietly become a way of not making it.",lean:"B",reason:"A home project is inexpensive to change or stop.",keepsake:"Make the first step small enough to feel safe."},
willow:{advice:"Notice which possibility makes you feel a little more alive. If you miss making things alongside other people, the class may offer something a home project cannot. You do not have to be good at painting to deserve that time. Curiosity is enough to begin.",lean:"A",reason:"The class may nurture both creativity and connection.",keepsake:"You can begin with curiosity, without proving anything."},
next_step:"Check one nearby class for a trial session, then set aside twenty minutes to paint with materials you already own."
};

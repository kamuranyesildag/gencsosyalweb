import re

with open("src/pages/Feed.tsx", "r") as f:
    content = f.read()

import_target = """import { Sparkles, Users, RefreshCw } from "lucide-react";"""
import_replacement = """import { Sparkles, Users, RefreshCw } from "lucide-react";
import { StarterQuestsCard } from "../components/StarterQuestsCard";
import { OnboardingModal } from "../components/OnboardingModal";"""

content = content.replace(import_target, import_replacement)

render_target = """      <header className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 pt-3.5 pb-2.5">"""
render_replacement = """      <OnboardingModal />
      <header className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 pt-3.5 pb-2.5">"""

content = content.replace(render_target, render_replacement)

post_target = """        <div className="border-b border-slate-200/80">
          <CreatePost onPostCreated={loadInitial} />
        </div>"""
post_replacement = """        <div className="border-b border-slate-200/80">
          <CreatePost onPostCreated={() => {
            loadInitial();
            window.dispatchEvent(new Event("refreshOnboarding"));
          }} />
        </div>
        
        <div className="px-4 sm:px-6 pt-4 sm:pt-6">
          <StarterQuestsCard />
        </div>"""

content = content.replace(post_target, post_replacement)

with open("src/pages/Feed.tsx", "w") as f:
    f.write(content)

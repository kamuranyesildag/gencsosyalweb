import re

with open("src/components/ui/SplashScreen.tsx", "r") as f:
    content = f.read()

target = """  useEffect(() => {
    // Check if we've already shown the splash screen in this session
    const hasShown = sessionStorage.getItem('splash_shown');
    
    if (hasShown || shouldReduceMotion) {
      setIsVisible(false);
      onComplete();
      return;
    }

    // Mark as shown for the session
    sessionStorage.setItem('splash_shown', 'true');"""

replacement = """  useEffect(() => {
    if (shouldReduceMotion) {
      setIsVisible(false);
      onComplete();
      return;
    }"""

content = content.replace(target, replacement)

with open("src/components/ui/SplashScreen.tsx", "w") as f:
    f.write(content)

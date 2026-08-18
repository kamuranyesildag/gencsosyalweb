with open("src/pages/PostDetail.tsx", "r") as f:
    content = f.read()

content = content.replace("<RichText content={currentContent} />", "<RichText text={currentContent} />")

with open("src/pages/PostDetail.tsx", "w") as f:
    f.write(content)

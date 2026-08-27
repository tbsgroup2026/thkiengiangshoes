import json

with open("web/src/lib/initialEmployees.ts", "r", encoding="utf-8") as f:
    text = f.read()

print("Length of initialEmployees.ts:", len(text))
if "201805008" in text:
    print("Found 201805008 in initialEmployees.ts!")
else:
    print("201805008 NOT in initialEmployees.ts!")

if "BIÊN" in text:
    print("Found BIÊN in initialEmployees.ts!")

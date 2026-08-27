import json

with open("web/src/lib/initialEmployees.ts", "r", encoding="utf-8") as f:
    lines = f.readlines()

start = False
json_lines = []
for line in lines:
    if line.strip().startswith("export const INITIAL_370_EMPLOYEES"):
        start = True
        json_lines.append("[\n")
        continue
    if start:
        json_lines.append(line)

json_str = "".join(json_lines)
if json_str.endswith(";\n"):
    json_str = json_str[:-2]

data = json.loads(json_str)

for item in data:
    if item.get("empCode") == "201805008":
        with open("bien_item.json", "w", encoding="utf-8") as f_out:
            json.dump(item, f_out, ensure_ascii=False, indent=2)
        print("Wrote bien_item.json")
        break

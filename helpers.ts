export function getFormatedDate(): string {
  const date = new Date()
  return `${date.getFullYear()}-${pad(String(date.getMonth()))}-${pad(String(date.getDate()))}\
_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
}

export function pad(str: string, num = 2): string {
  let out = String(str)
  while (out.length < num) {
    out = `0${out}`
  }
  return out
}

export function errorExit(...e: any): never {
  console.log(...e)
  return process.exit(1)
}

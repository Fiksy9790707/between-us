export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function fileBaseName(file: File) {
  return file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

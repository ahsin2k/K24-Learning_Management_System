export const beFileUrl = (filePath: string) => {
  return `${import.meta.env.VITE_BE_DOMAIN}/${filePath}`;
}

function getFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname; 
    const name = pathname.substring(pathname.lastIndexOf("/") + 1);
    return name || "default-file-name";
  } catch {
    return "default-file-name";
  }
}

export async function urlToFile(url?: string): Promise<File | null> {
  if (!url) {
    return null;
  }

  const response = await fetch(url);
  const blob = await response.blob();

  // lấy mime từ header, nếu không có thì dùng blob.type
  const mimeType = response.headers.get("content-type") || blob.type || "application/octet-stream";

  // tự động lấy tên file từ url
  const filename = getFileNameFromUrl(url);

  return new File([blob], filename, { type: mimeType });
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
}

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }) + " " + date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: 'numeric',
  });
}

export const clsx = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
}
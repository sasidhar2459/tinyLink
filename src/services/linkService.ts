import { prisma } from "@/lib/prisma";
import { generateCode } from "./codeGenerator";
import { isValidUrl } from "@/validators/urlValidator";
import { isValidCode } from "@/validators/codeValidator";

export async function createLink(url: string, customCode?: string) {
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL format");
  }

  let code = customCode;
  if (code) {
    if (!isValidCode(code)) {
      throw new Error("Invalid code format. Must be 6-8 alphanumeric characters");
    }

    const existing = await prisma.link.findUnique({ where: { code } });
    if (existing) {
      throw new Error("Code already exists");
    }
  } else {
    // Auto-generate unique code
    let attempts = 0;
    do {
      code = generateCode();
      const existing = await prisma.link.findUnique({ where: { code } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new Error("Failed to generate unique code");
    }
  }

  const link = await prisma.link.create({
    data: {
      code,
      url,
    },
  });

  return link;
}

export async function getAllLinks() {
  const links = await prisma.link.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return links;
}

export async function getLinkByCode(code: string) {
  const link = await prisma.link.findUnique({
    where: { code },
  });
  return link;
}

export async function deleteLink(code: string) {
  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) {
    throw new Error("Link not found");
  }

  await prisma.link.delete({
    where: { code },
  });

  return { success: true };
}

export async function updateLink(code: string, url: string, newCode?: string) {
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL format");
  }

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) {
    throw new Error("Link not found");
  }

  if (newCode && newCode !== code) {
    if (!isValidCode(newCode)) {
      throw new Error("Invalid code format. Must be 6-8 alphanumeric characters");
    }

    const existing = await prisma.link.findUnique({ where: { code: newCode } });
    if (existing) {
      throw new Error("Code already exists");
    }
  }

  const updatedLink = await prisma.link.update({
    where: { code },
    data: {
      url,
      ...(newCode && newCode !== code ? { code: newCode } : {})
    },
  });

  return updatedLink;
}

export async function incrementClicks(code: string) {
  const link = await prisma.link.update({
    where: { code },
    data: {
      clicks: { increment: 1 },
      lastClicked: new Date(),
    },
  });
  return link;
}

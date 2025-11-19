import { prisma } from "@/lib/prisma";
import { generateCode } from "./codeGenerator";
import { isValidUrl } from "@/validators/urlValidator";
import { isValidCode } from "@/validators/codeValidator";

export async function createQRCode(url: string, customCode?: string) {
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL format");
  }

  let code = customCode;
  if (code) {
    if (!isValidCode(code)) {
      throw new Error("Invalid code format. Must be 6-8 alphanumeric characters");
    }

    const existing = await prisma.qRCode.findUnique({ where: { code } });
    if (existing) {
      throw new Error("Code already exists");
    }
  } else {
    // Auto-generate unique code
    let attempts = 0;
    do {
      code = generateCode();
      const existing = await prisma.qRCode.findUnique({ where: { code } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new Error("Failed to generate unique code");
    }
  }

  const qrCode = await prisma.qRCode.create({
    data: {
      code,
      url,
    },
  });

  return qrCode;
}

export async function getAllQRCodes() {
  const qrCodes = await prisma.qRCode.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return qrCodes;
}

export async function getQRCodeByCode(code: string) {
  const qrCode = await prisma.qRCode.findUnique({
    where: { code },
  });
  return qrCode;
}

export async function deleteQRCode(code: string) {
  const qrCode = await prisma.qRCode.findUnique({ where: { code } });
  if (!qrCode) {
    throw new Error("QR Code not found");
  }

  await prisma.qRCode.delete({
    where: { code },
  });

  return { success: true };
}

export async function updateQRCode(code: string, url: string, newCode?: string) {
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL format");
  }

  const qrCode = await prisma.qRCode.findUnique({ where: { code } });
  if (!qrCode) {
    throw new Error("QR Code not found");
  }

  if (newCode && newCode !== code) {
    if (!isValidCode(newCode)) {
      throw new Error("Invalid code format. Must be 6-8 alphanumeric characters");
    }

    const existing = await prisma.qRCode.findUnique({ where: { code: newCode } });
    if (existing) {
      throw new Error("Code already exists");
    }
  }

  const updatedQRCode = await prisma.qRCode.update({
    where: { code },
    data: {
      url,
      ...(newCode && newCode !== code ? { code: newCode } : {})
    },
  });

  return updatedQRCode;
}

export async function incrementScans(code: string) {
  const qrCode = await prisma.qRCode.update({
    where: { code },
    data: {
      scans: { increment: 1 },
      lastScanned: new Date(),
    },
  });
  return qrCode;
}

const UploadImageService = require("../../../../src/modules/product/core/services/upload-image.service");
const cloudinary = require("../../../../src/config/cloudinary.config");

// Mock do Cloudinary
jest.mock("../../../../src/config/cloudinary.config", () => ({
  uploader: {
    upload: jest.fn(),
  },
}));

describe("UploadImageService - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve fazer upload de imagem PNG com sucesso", async () => {
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/test/image/upload/v1/test.jpg",
      public_id: "products/test",
    });

    const result = await UploadImageService.execute({
      type: "image/png",
      content: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
    });

    expect(result).toEqual({
      url: "https://res.cloudinary.com/test/image/upload/v1/test.jpg",
      public_id: "products/test",
    });
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
      {
        folder: "products",
        resource_type: "image",
      }
    );
  });

  it("deve fazer upload de imagem JPEG com sucesso", async () => {
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/test/image/upload/v1/test.jpg",
      public_id: "products/test",
    });

    const result = await UploadImageService.execute({
      type: "image/jpeg",
      content: "/9j/4AAQSkZJRgABAQEAYABgAAD",
    });

    expect(result).toEqual({
      url: "https://res.cloudinary.com/test/image/upload/v1/test.jpg",
      public_id: "products/test",
    });
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD",
      {
        folder: "products",
        resource_type: "image",
      }
    );
  });

  it("deve lançar erro quando Cloudinary falhar", async () => {
    cloudinary.uploader.upload.mockRejectedValue(new Error("Cloudinary error"));

    await expect(
      UploadImageService.execute({
        type: "image/png",
        content: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
      })
    ).rejects.toThrow("Cloudinary error");
  });

  it("deve criar dataUri corretamente com tipo MIME", async () => {
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/test/image/upload/v1/test.jpg",
      public_id: "products/test",
    });

    await UploadImageService.execute({
      type: "image/webp",
      content: "UklGRiQAAABXRUJQVlA4IBgAAAAw",
    });

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAw",
      expect.any(Object)
    );
  });

  it("deve enviar para pasta 'products' no Cloudinary", async () => {
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/test/image/upload/v1/products/test.jpg",
      public_id: "products/test",
    });

    await UploadImageService.execute({
      type: "image/png",
      content: "iVBORw0KGgoAAAANSUhEUgAAAAUA",
    });

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(expect.any(String), {
      folder: "products",
      resource_type: "image",
    });
  });
});

class UploadImageResponseDto {
  static toResponse(data) {
    return {
      url: data.url,
      public_id: data.public_id,
    };
  }
}

module.exports = UploadImageResponseDto;

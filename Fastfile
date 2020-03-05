lane :release do
  sync_code_signing
  disable_automatic_code_signing(path: "ios/begun.xcodeproj")
  build_app
  enable_automatic_code_signing(path: "ios/begun.xcodeproj")
  upload_to_testflight
end
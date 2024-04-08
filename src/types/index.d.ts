declare global {
  interface Window {
    hive_keychain?: any
    innerWidth?: any
  }
}

interface Validation {
  success: boolean
  message?: string
}

export { Validation, global }

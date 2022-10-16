import { createNavigationContainerRef } from '@react-navigation/native'

// 汎用的なナビゲーションであり、型指定が難しいため
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const navigationRef = createNavigationContainerRef<any>()

export function navigate(name: string, params?: any) {
  const ref = navigationRef.current
  if (ref === null) {
    console.warn(
      'NavigationService#navigate: NavigationContainerRef is null. ' +
        'May be call #navigate() before NavigationContainer is initialized',
    )
    return
  }
  ref.navigate(name, params)
}

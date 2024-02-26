import useZapier from './useZapier'

export default function useNewsletter() {
  const config = useRuntimeConfig()
  const { IS_PRODUCTION, ZAP_NEWSLETTER } = config.public

  const { zap } = useZapier()

  function subscribe(email: string): Promise<boolean> {
    return new Promise(async resolve => {
      if (!IS_PRODUCTION) {
        console.warn(
          `WARN! The Newsletter subscriptions are not registered in staging environments. Email ${email}.`
        )
        return resolve(true)
      }
      return resolve(
        await zap({
          slug: ZAP_NEWSLETTER as string,
          data: { email },
        })
      )
    })
  }

  return {
    subscribe,
  }
}

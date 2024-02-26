interface Request {
  status: string
}

export default function useZapier() {
  const config = useRuntimeConfig()
  const { ZAP_BASE_URL } = config.public

  function zap(params: { slug: string; data: any }): Promise<boolean> {
    const { slug, data } = params
    return new Promise(async (resolve): Promise<void> => {
      try {
        await $fetch<Request>(ZAP_BASE_URL + slug, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(data),
        })
        return resolve(true)
      } catch (error) {
        return resolve(false)
      }
    })
  }

  return { zap }
}

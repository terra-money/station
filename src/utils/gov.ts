export const isWhitelisted = (url?: string) => {
  if (!url) return false
  if (!url.match(/https?:\/\/.*/)) {
    url = `https://${url}`
  }

  try {
    const hostname = new URL(url).hostname
    return hostname === "terra.money" || hostname.endsWith(".terra.money")
  } catch (error) {
    return false
  }
}

/* exempted URLs are displayed as written (but not linked) */
export const isExempted = (url?: string) => {
  const exempted = ["terra.py"]
  if (!url) return false

  return exempted.includes(url.toLowerCase())
}

/* include 2 and 3 character domains + .money as anchor TLDs for url detection; based on https://data.iana.org/TLD/tlds-alpha-by-domain.txt */
export const URL_REGEX =
  /((?:https?:\/\/)?(?:[A-Z0-9-]+?\s*\.\s*)*?(?:\b[A-Z0-9-]{1,63}?)(?:(?:\s*\.(?:am|an|as|at|be|by|do|it|in|is|how|new|no|one|so|top|to))|(?:\s*\.\s*(?:ads|afl|app|axa|ac|ad|ae|af|ag|ai|al|ao|aq|ar|au|aw|ax|az|bar|bbc|bid|bio|biz|bmw|boo|bzh|ba|bb|bd|bf|bg|bh|bi|bj|bl|bm|bn|bo|bq|br|bs|bt|bv|bw|bz|cab|cal|cat|cbn|ceo|cfd|com|crs|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|dad|day|dev|dnp|de|dj|dk|dm|dz|eat|edu|esq|eus|ec|ee|eg|eh|er|es|et|eu|fan|fit|fly|foo|frl|fi|fj|fk|fm|fo|fr|gal|gdn|gle|gmo|gmx|goo|gop|gov|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hiv|hk|hm|hn|hr|ht|hu|ibm|ifm|ing|ink|int|iwc|id|ie|il|im|io|iq|ir|jcb|je|jm|jo|jp|kim|krd|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|lat|lds|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|money|mil|mma|moe|mov|mtn|ma|mc|md|me|mf|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|net|ngo|nhk|nra|nrw|ntt|nyc|na|nc|ne|nf|ng|ni|nl|np|nr|nu|nz|ong|onl|ooo|org|ovh|om|pro|pub|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|red|ren|rio|rip|re|ro|rs|ru|rw|sap|sca|scb|sew|sky|soy|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|sr|ss|st|su|sv|sx|sy|sz|tax|tel|tui|tc|td|tf|tg|th|tj|tk|tl|tm|tn|tp|tr|tt|tv|tw|z|uno|uol|ua|ug|uk|um|us|uy|uz|vet|va|vc|ve|vg|vi|vn|vu|wed|win|wme|wtc|wtf|wf|ws|xin|xxx|xyz|ye|yt|zip|za|zm|zw))+?\b)(?:\/[^.!,?;"'<>()[\]{}\s\x7F-\xFF]*(?:[.!,?]+[^.!,?;"'<>()[\]{}\s\x7F-\xFF]+)*)?)/gi

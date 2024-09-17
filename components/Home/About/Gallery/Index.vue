<template>
  <div class="home__about__gallery">
    <Ticker>
      <HomeAboutGalleryImage :pos="1" :columns="4" />
      <HomeAboutGalleryImage :pos="2" :columns="3" />
      <HomeAboutGalleryImage :pos="3" :columns="5" />
      <HomeAboutGalleryImage :pos="4" :columns="6" />
      <HomeAboutGalleryImage :pos="5" :columns="3" />
      <HomeAboutGalleryImage :pos="6" :columns="4" />
      <HomeAboutGalleryImage :pos="7" :columns="6" />
      <HomeAboutGalleryImage :pos="8" :columns="4" />
      <HomeAboutGalleryImage :pos="9" :columns="5" />
      <HomeAboutGalleryImage :pos="10" :columns="3" />
      <HomeAboutGalleryImage :pos="11" :columns="2" />
      <HomeAboutGalleryImage :pos="12" :columns="4" />
      <HomeAboutGalleryImage :pos="13" :columns="6" />
      <HomeAboutGalleryImage :pos="14" :columns="4" />
    </Ticker>
  </div>
</template>

<style lang="scss">
.home__about__gallery {
  margin: 2rem 0;
}
</style>

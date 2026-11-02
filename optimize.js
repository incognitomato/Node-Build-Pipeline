import sharp from 'sharp';

async function optimizeHomepageImage() {
 try {
    const img = 'src/assets/img/pet';
    const width = 800;

    await sharp(`${img}.jpg`)
      .resize({ width: width, withoutEnlargement: true }) 
      .webp({ quality: 78 }) 
      .toFile(`${img}.webp`);      
    console.log('Image optimized and saved as WebP!');
  } catch (error) {
    console.error('Error optimizing image:', error);
  }
}

optimizeHomepageImage();

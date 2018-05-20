
//
// Copyright (C) 2017-2018 DBot.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

enum IMAGE_FORMAT {
	AAI,
	ART,
	ARW,
	AVI,
	AVS,
	BPG,
	BMP,
	BRF,
	CALS,
	CGM,
	CIN,
	CIP,
	CMYK,
	CMYKA,
	CR2,
	CRW,
	CUR,
	CUT,
	DCM,
	DCR,
	DCX,
	DDS,
	DIB,
	DJVU,
	DNG,
	DOT,
	DPX,
	EMF,
	EPDF,
	EPI,
	EPS,
	EPS2,
	EPS3,
	EPSF,
	EPSI,
	EPT,
	EXR,
	FAX,
	FIG,
	FITS,
	FPX,
	GIF,
	GPLT,
	GRAY,
	GRAYA,
	HDR,
	HEIC,
	HPGL,
	HRZ,
	HTML,
	ICO,
	INFO,
	INLINE,
	ISOBRL,
	ISOBRL6,
	JBIG,
	JNG,
	JP2,
	JPT,
	J2C,
	J2K,
	JPEG,
	JXR,
	JSON,
	MAN,
	MAT,
	MIFF,
	MONO,
	MNG,
	M2V,
	MPEG,
	MPC,
	MPR,
	MRW,
	MSL,
	MTV,
	MVG,
	NEF,
	ORF,
	OTB,
	P7,
	PALM,
	PAM,
	PBM,
	PCD,
	PCDS,
	PCL,
	PCX,
	PDB,
	PDF,
	PEF,
	PES,
	PFA,
	PFB,
	PFM,
	PGM,
	PICON,
	PICT,
	PIX,
	PNG,
	PNG8,
	PNG00,
	PNG24,
	PNG32,
	PNG48,
	PNG64,
	PNM,
	PPM,
	PS,
	PS2,
	PS3,
	PSB,
	PSD,
	PTIF,
	PWP,
	RAD,
	RAF,
	RGB,
	RGBA,
	RGF,
	RLA,
	RLE,
	SCT,
	SFW,
	SGI,
	SHTML,
	SID,
	SUN,
	SVG,
	TEXT,
	TGA,
	TIFF,
	TIM,
	TTF,
	TXT,
	UBRL,
	UBRL6,
	UIL,
	UYVY,
	VICAR,
	VIFF,
	WBMP,
	WDP,
	WEBP,
	WMF,
	WPG,
	X,
	XBM,
	XCF,
	XPM,
	XWD,
	X3F,
	YCbCr,
	YCbCrA,
	YUV,

	UNKNOWN
}

enum COLOR_SPACE {
	CIELab,
	CMY,
	CMYK,
	Gray,
	HCL,
	HCLp,
	HSB,
	HSI,
	HSL,
	HSV,
	HWB,
	Lab,
	LCH,
	LCHab,
	LCHuv,
	LMS,
	Log,
	Luv,
	OHTA,
	Rec601YCbCr,
	Rec709YCbCr,
	RGB,
	scRGB,
	sRGB,
	Transparent,
	xyY,
	XYZ,
	YCbCr,
	YDbDr,
	YCC,
	YIQ,
	YPbPr,
	YUV,

	UNKNOWN
}

enum SIZE_MULTIPLIER {
	B = 1,
	KB = 1024,
	MB = 1024 * 1024,
	GB = 1024 * 1024 * 1024,
	TB = 1024 * 1024 * 1024 * 1024,
}

import child_process = require('child_process')
const spawn = child_process.spawn

enum IMAGE_CLAMP_STATUS {
	NORMAL = 0,
	TOO_SMALL_WIDTH = 0x2,
	TOO_SMALL_HEIGHT = 0x4,
	TOO_BIG_WIDTH = 0x8,
	TOO_BIG_HEIGHT = 0x10,
}

class ImageIdentify {
	identified = false
	invalid = false
	width: number | null = null
	height: number | null = null
	additiveX: number | null = null
	additiveY: number | null = null
	format: IMAGE_FORMAT | null = null

	color_space: COLOR_SPACE | null = null
	size: number | null = null
	size_original: number | null = null
	size_type: SIZE_MULTIPLIER | null = null
	depth: number | null = null

	constructor(public path?: string) {

	}

	setPath(path: string) {
		this.path = path
		this.identified = false
		this.invalid = false
		return this
	}

	get isTIFF() { return this.format == IMAGE_FORMAT.TIFF }
	get isBMP() { return this.format == IMAGE_FORMAT.BMP }
	get isPNG() { return this.format == IMAGE_FORMAT.PNG }
	get isJPG() { return this.format == IMAGE_FORMAT.JPEG }
	get isJPEG() { return this.format == IMAGE_FORMAT.JPEG }
	get isGIF() { return this.format == IMAGE_FORMAT.GIF }
	get isWEBP() { return this.format == IMAGE_FORMAT.WEBP }
	get isWEPPY() { return this.format == IMAGE_FORMAT.WEBP }
	get isWeppy() { return this.format == IMAGE_FORMAT.WEBP }

	get isStatic() {
		return this.isTIFF || this.isBMP || this.isPNG || this.isJPEG || this.isWEBP
	}

	get isLarge() { return this.width && this.height && (this.width > 1500 || this.height > 1500) || false }
	get isSmall() { return this.width && this.height && (this.width < 400 && this.height < 400) || false }

	get aspectRatio() { return this.width && this.height && this.width / this.height || 1}
	get wildAspectRatio() { return this.aspectRatio < 0.35 || this.aspectRatio >= 2.5}

	static IMAGE_CLAMP_STATUS = IMAGE_CLAMP_STATUS

	// does not provide exactly clamped values
	clamp(minWidth: number, minHeight: number, maxWidth: number, maxHeight: number) {
		if (!this.identified) {
			throw new Error('Image is not alredy identified!')
		}

		let clampStatus = IMAGE_CLAMP_STATUS.NORMAL

		if (this.width! < minWidth) {
			clampStatus += IMAGE_CLAMP_STATUS.TOO_SMALL_WIDTH
		}

		if (this.height! < minHeight) {
			clampStatus += IMAGE_CLAMP_STATUS.TOO_SMALL_HEIGHT
		}

		if (this.width! > maxWidth) {
			clampStatus += IMAGE_CLAMP_STATUS.TOO_BIG_WIDTH
		}

		if (this.height! > maxHeight) {
			clampStatus += IMAGE_CLAMP_STATUS.TOO_BIG_HEIGHT
		}

		switch (clampStatus) {
			// all good
			case IMAGE_CLAMP_STATUS.NORMAL:
				return [this.width!, this.height!]

			// straight
			case IMAGE_CLAMP_STATUS.TOO_SMALL_WIDTH:
				return [minWidth, minWidth / this.aspectRatio]
			case IMAGE_CLAMP_STATUS.TOO_BIG_WIDTH:
				return [maxWidth, maxWidth / this.aspectRatio]
			case IMAGE_CLAMP_STATUS.TOO_SMALL_HEIGHT:
				return [minHeight * this.aspectRatio, minHeight]
			case IMAGE_CLAMP_STATUS.TOO_BIG_HEIGHT:
				return [maxHeight * this.aspectRatio, maxHeight]

			case IMAGE_CLAMP_STATUS.TOO_SMALL_WIDTH + IMAGE_CLAMP_STATUS.TOO_SMALL_HEIGHT:
				if (minWidth < minHeight) {
					return [minHeight * this.aspectRatio, minHeight]
				} else if (minWidth > minHeight) {
					return [minWidth, minWidth / this.aspectRatio]
				} else {
					return [minWidth, minHeight]
				}

			case IMAGE_CLAMP_STATUS.TOO_BIG_WIDTH + IMAGE_CLAMP_STATUS.TOO_BIG_HEIGHT:
				if (maxWidth < maxHeight) {
					return [maxHeight * this.aspectRatio, maxHeight]
				} else if (maxWidth > maxHeight) {
					return [maxWidth, maxWidth / this.aspectRatio]
				} else {
					return [maxWidth, maxHeight]
				}

			case IMAGE_CLAMP_STATUS.TOO_SMALL_WIDTH + IMAGE_CLAMP_STATUS.TOO_BIG_HEIGHT:
				return [null, null]
			case IMAGE_CLAMP_STATUS.TOO_SMALL_HEIGHT + IMAGE_CLAMP_STATUS.TOO_BIG_WIDTH:
				return [null, null]
		}

		return [null, null]
	}

	// 2018-05-01_13-28-43.png PNG 424x161 424x161+0+0 8-bit sRGB 88.2KB 0.000u 0:00.000
	static matchExp = ' ([a-zA-Z]+) ([0-9]+)x([0-9]+) [0-9]+x[0-9]+\\+([0-9]+)\\+([0-9]+) ([0-9]+)-bit ([a-zA-Z]+) ([0-9\\.]+)([A-Z]+)'

	identify(): Promise<this> {
		return new Promise((resolve, reject) => {
			if (!this.path) {
				reject('No path were specified!')
				return
			}

			if (this.identified) {
				resolve(this)
				return
			}

			const identify = spawn('identify', [this.path])
			identify.stderr.pipe(process.stderr)

			let buffout = ''

			identify.stdout.on('data', (chunk: Buffer) => {
				buffout += chunk.toString('utf8')
			})

			identify.on('close', (code) => {
				if (code == 0) {
					const matchData = buffout.match(new RegExp(this.path + ImageIdentify.matchExp))

					if (matchData == null) {
						reject('Image is either invalid or identify command failed to identify provided image')
						return
					}

					this.identified = true
					this.format = IMAGE_FORMAT[matchData[1]] || IMAGE_FORMAT.UNKNOWN
					this.width = parseInt(matchData[2])
					this.height = parseInt(matchData[3])
					this.additiveX = parseInt(matchData[4])
					this.additiveY = parseInt(matchData[5])
					this.depth = parseInt(matchData[6])
					this.color_space = COLOR_SPACE[matchData[7]] || COLOR_SPACE.UNKNOWN
					this.size_original = parseFloat(matchData[8])
					this.size_type = SIZE_MULTIPLIER[matchData[9]]

					if (this.size_type) {
						this.size = this.size_original * this.size_type
					} else {
						this.size = this.size_original
					}

					resolve(this)
				} else {
					this.invalid = true
				}
			})
		})
	}
}

export {IMAGE_FORMAT, COLOR_SPACE, SIZE_MULTIPLIER, ImageIdentify}

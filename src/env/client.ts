import Joi from 'joi';

const clientSchema = Joi.object({
    NEXT_PUBLIC_BASE_PATH: Joi.string().allow('').optional(),
    NEXT_PUBLIC_FIREBASE_API_KEY: Joi.string().required(),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: Joi.string().required(),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: Joi.string().required(),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: Joi.string().optional(),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: Joi.string().optional(),
    NEXT_PUBLIC_FIREBASE_APP_ID: Joi.string().optional(),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: Joi.string().optional(),
}).unknown();

const processEnv = {
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// We use the explicit object so Next.js can inline the values during build
const { error, value } = clientSchema.validate(processEnv, { abortEarly: false });

if (error) {
    console.error('🚨 Client Environment Validation Error:', error.message);
    // Throwing here ensures that if required envs are missing, the app breaks visibly (DX)
    throw new Error(`Invalid Client Environment: ${error.message}`);
}

export const clientEnv = {
    NEXT_PUBLIC_BASE_PATH: value.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_FIREBASE_API_KEY: value.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: value.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: value.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: value.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: value.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: value.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: value.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

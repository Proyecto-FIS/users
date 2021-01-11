# users
User-accounts management

## Account Schema
```
Account:
    _id:  UUID
    createdAt: timestamp
    updatedAt: timestamp
    isCustomer: Boolean
    email: String
    username: String
    password: String
```
## Customer Schema
```
Customer:
    _id:  UUID
    createdAt: timestamp
    updatedAt: timestamp
    pictureUrl: String
    address: String
    stripe_id: String
    account: UUID
```

## Toaster Schema
```
Toaster:
    _id:  UUID
    createdAt: timestamp
    updatedAt: timestamp
    name: String
    description: String
    phoneNumber: String
    address: String
    pictureUrl: String
    instagramUrl: String
    facebookUrl: String
    twitterUrl: String
    account: UUID
```

Environment variables:
- TOKEN_EXPIRATION_TIME: time in seconds until user token expires
- STRIPE_PUBLIC_KEY: Stripe public key
- REGION: AWS S3 server region
- AWS_BUCKET_NAME: Name of the AWS bucket made to save images
- AWS_ID: Amazon web services credentials
- AWS_SECRET_NAME: Amazon web services credentials

## API URL
[Coffaine Products](https://coffaine-users.herokuapp.com/)
## API Documentation
[Swagger docs](https://coffaine-users.herokuapp.com/api-docs)
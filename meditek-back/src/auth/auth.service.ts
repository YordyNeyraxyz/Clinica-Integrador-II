import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService) { }

    async googleLogin(idToken: string) {

        const decodedToken = await admin.auth().verifyIdToken(idToken);

        const { uid, email, name } = decodedToken;

        let user = await this.prisma.user.findUnique({
            where: { firebaseUid: uid }
        });

        if (!user) {
            return {
                success: true,
                token: 'fake-jwt-temporal',
                isFirstLogin: true,
                user: {
                    firebaseUid: uid,
                    email,
                    name
                }
            };
        }

        return {
            success: true,
            token: 'fake-jwt-temporal',
            user
        };
    }

    async completeProfile(data: any) {

        const user = await this.prisma.user.create({
            data: {
                firebaseUid: data.firebaseUid,
                email: data.email,
                name: data.name,
                dni: data.dni,
                age: data.age,
                role: 'PATIENT'
            }
        });

        return {
            success: true,
            token: 'fake-jwt-temporal',
            user
        };
    }
}
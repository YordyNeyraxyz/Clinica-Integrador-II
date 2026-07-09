import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('google')
    async googleLogin(@Body() body: { idToken: string }) {
        return this.authService.googleLogin(body.idToken);
    }

    @Post('complete-profile')
    async completeProfile(@Body() body: any) {
        return this.authService.completeProfile(body);
    }
}
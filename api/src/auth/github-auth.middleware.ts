import { Injectable, NestMiddleware, UnauthorizedException, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

interface GitHubUserResponse {
  id: number;
  email: string | null;
  name: string | null;
  login: string;
  avatar_url: string;
}

@Injectable()
export class GithubAuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No GitHub token provided');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the GitHub token and get user data
      const { data } = await axios.get<GitHubUserResponse>('https://api.github.com/user', {
        headers: { 
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json'
        },
      });

      if (!data.id) {
        throw new UnauthorizedException('Invalid GitHub user data: missing user ID');
      }
      
      // Get the primary email if email is not public
      let userEmail = data.email;
      if (!userEmail) {
        const emailsResponse = await axios.get<Array<{email: string, primary: boolean, verified: boolean}>>(
          'https://api.github.com/user/emails',
          { headers: { Authorization: `token ${token}` } }
        );
        const primaryEmail = emailsResponse.data.find(email => email.primary && email.verified);
        if (primaryEmail) {
          userEmail = primaryEmail.email;
        }
      }
      
      if (!userEmail) {
        userEmail = `${data.id}@users.noreply.github.com`;
      }
      
      // Log the incoming GitHub data for debugging
      console.log('GitHub user data:', {
        id: data.id,
        login: data.login,
        name: data.name,
        email: data.email,
        githubId: data.id.toString()
      });
      
      // Find or create the user
      const user = await this.prisma.user.upsert({
        where: { email: userEmail },
        update: {
          name: data.name || data.login,
        },
        create: {
          email: userEmail,
          name: data.name || data.login,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Attach user info to the request
      const userInfo = {
        id: user.id,
        githubId: data.id.toString(),
        email: user.email,
        name: user.name || data.login, // Fallback to GitHub login if name is not set
        avatarUrl: data.avatar_url,
      };

      req['user'] = userInfo;

      // Set a cookie or session if needed
      // This is optional and depends on your authentication strategy
      if (!res.headersSent) {
        res.setHeader('x-user-id', user.id);
      }
      
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid GitHub token');
    }
  }
}

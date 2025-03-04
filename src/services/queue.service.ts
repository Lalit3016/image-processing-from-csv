import Bull from 'bull'; 
import { ProcessingJob } from '../types'; 
import { environment } from '../utils/environment';
import logger from '../common/logger';
export class QueueService {
  private static _instance: QueueService;
  private imageQueue: Bull.Queue;
  
  private constructor() {
    this.imageQueue = new Bull('image-processing', environment.redisUrl);
    
    // Error handling for queue
    this.imageQueue.on('error', (error:any) => {
      logger.error('Queue error:', error);
    });
    
    this.imageQueue.on('failed', (job:any, error:any) => {
      logger.error(`Job ${job.id} failed:`, error);
    });
  }
  
  public static get instance(): QueueService {
    if (!QueueService._instance) {
      QueueService._instance = new QueueService();
    }
    return QueueService._instance;
  }
  
  public async addJob(job: ProcessingJob): Promise<Bull.Job> {
    return this.imageQueue.add(job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true
    });
  }
  
  public getQueue(): Bull.Queue {
    return this.imageQueue;
  }
  
  public async getJobCounts(): Promise<Bull.JobCounts> {
    return this.imageQueue.getJobCounts();
  }
}

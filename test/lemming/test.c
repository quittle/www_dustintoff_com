#include <pthread.h>
#include <semaphore.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/mman.h>

#include <string.h>
#include <errno.h>

#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]){
	int key = 11235813;
	int size = 100;
	
	printf("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n\n");

	sem_t semaphore;
	int temp = 0;
	
	int fd = open("test.txt", O_RDWR|O_CREAT, S_IRWXU);
	write(fd, &temp, sizeof(int));
	int* ptr = mmap(NULL, sizeof(int),PROT_READ|PROT_WRITE,MAP_SHARED,fd,0);
	close(fd);
	
	if(sem_init(&semaphore,1,0)<0){
		printf("ERROR sem_init (%s)\n", strerror(errno));
		exit(-1);
	}
	
	printf("%d\n", semaphore); 
}

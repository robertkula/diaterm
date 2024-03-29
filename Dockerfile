#https://dev.to/s1ntaxe770r/how-to-setup-ssh-within-a-docker-container-i5i
FROM ubuntu:latest
RUN apt update && apt install openssh-server sudo -y
RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 test 
RUN echo 'test:test1' | chpasswd
RUN echo 'root:root' | chpasswd
RUN service ssh start
EXPOSE 22
CMD ["/usr/sbin/sshd","-D"]
